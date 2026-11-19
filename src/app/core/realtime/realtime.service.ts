import { Injectable, computed, isDevMode, signal } from '@angular/core';

import {
    AccessEvent, AccessEventDto, DeviceDto, DeviceInfo, DeviceKind, DeviceView,
    EnrollState, LinkStatus, ServerMessage,
} from './realtime.model';

/** ws://host:8000/events/ws (o wss:// si la API usa https). */
const WS_URL = `http://localhost:8000/events/ws`;

const MAX_BACKOFF_MS = 15_000;
const READING_TIMEOUT_MS = 6_000; // el ESP espera la respuesta máx. 5 s
const MAX_FEED = 100;
const ENROLL_ERRORS: string[] = [
    'FIRST_CAPTURE_ERROR', 'SECOND_CAPTURE_ERROR', 'MISMATCH', 'STORE_ERROR',
];

const toDate = (value: string | null): Date | null => (value ? new Date(value) : null);

const toDevice = (d: DeviceDto): DeviceInfo => ({
    deviceId: d.device_id,
    kind: d.kind,
    online: d.online,
    lastSeen: toDate(d.last_seen),
});

const toAccessEvent = (e: AccessEventDto): AccessEvent => ({
    id: e.id,
    at: new Date(e.at), // sin zona horaria => hora local, igual que el backend
    deviceId: e.device_id,
    granted: e.granted,
    accessType: e.access_type,
    reason: e.reason,
    customer: e.customer && {
        nuip: e.customer.nuip,
        fullName: e.customer.full_name,
        photoUrl: e.customer.photo_url,
    },
    membershipEnd: e.membership_end,
});

/**
 * Enlace en tiempo real con la API: dispositivos, lecturas y accesos.
 * Solo escucha; las órdenes (registrar huella, capturar foto...) van por REST.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {

    private socket?: WebSocket;
    private attempt = 0;
    private retryTimer?: ReturnType<typeof setTimeout>;
    private readingTimer?: ReturnType<typeof setTimeout>;
    private manualClose = false;

    private readonly _link = signal<LinkStatus>('connecting');
    private readonly _devices = signal<Record<string, DeviceInfo>>({});
    private readonly _reading = signal(false);
    private readonly _lastAccess = signal<AccessEvent | null>(null);
    private readonly _feed = signal<AccessEvent[]>([]);
    private readonly _enroll = signal<EnrollState | null>(null);

    /** Estado de la conexión del navegador con la API. */
    readonly link = this._link.asReadonly();
    /** Hay un dedo sobre el lector y se está validando. */
    readonly reading = this._reading.asReadonly();
    /** Último evento de acceso (cada evento nuevo es un objeto nuevo). */
    readonly lastAccess = this._lastAccess.asReadonly();
    /** Accesos recibidos en esta sesión, el más reciente primero. */
    readonly feed = this._feed.asReadonly();
    readonly enroll = this._enroll.asReadonly();

    readonly devices = computed<DeviceView[]>(() => {
        const linked = this._link() === 'open';
        return Object.values(this._devices()).map(({ online, ...d }) => ({
            ...d,
            state: !linked ? 'unknown' : online ? 'online' : 'offline',
        }));
    });

    readonly biometric = computed(() => this.firstOf('biometric'));
    readonly camera = computed(() => this.firstOf('camera'));

    constructor() {
        // Al volver la red, no esperes al siguiente reintento.
        window.addEventListener('online', () => this.retryNow());
    }

    connect(): void {
        const s = this.socket;
        if (s && (s.readyState === WebSocket.OPEN || s.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.manualClose = false;
        clearTimeout(this.retryTimer);

        const ws = new WebSocket(WS_URL);
        this.socket = ws;

        ws.onopen = () => {
            this.attempt = 0;
            this._link.set('open'); // el servidor envía un SNAPSHOT enseguida
        };
        ws.onmessage = e => this.onMessage(e.data);
        ws.onerror = () => ws.close(); // el cierre real se maneja en onclose
        ws.onclose = () => {
            if (this.socket !== ws) return; // socket viejo, ya reemplazado
            this.socket = undefined;
            if (this.manualClose) return;
            this._link.set('reconnecting');
            this.scheduleReconnect();
        };
    }

    disconnect(): void {
        this.manualClose = true;
        clearTimeout(this.retryTimer);
        this.socket?.close();
        this.socket = undefined;
    }

    /** Solo desarrollo: inyecta un mensaje como si llegara del servidor. */
    simulate(message: ServerMessage): void {
        if (isDevMode()) this.onMessage(JSON.stringify(message));
    }

    /** Llamar antes de iniciar un registro de huella para limpiar el estado anterior. */
    beginEnroll(): void {
        this._enroll.set({ step: 'PLACE_FINGER', finished: false, ok: false });
    }

    clearEnroll(): void {
        this._enroll.set(null);
    }

    private firstOf(kind: DeviceKind): DeviceView | null {
        return this.devices().find(d => d.kind === kind) ?? null;
    }

    private retryNow(): void {
        if (this._link() === 'open') return;
        clearTimeout(this.retryTimer);
        this.attempt = 0;
        this.connect();
    }

    private scheduleReconnect(): void {
        const delay = Math.min(1000 * 2 ** this.attempt++, MAX_BACKOFF_MS)
            + Math.random() * 500; // evita que todas las pantallas reconecten a la vez
        this.retryTimer = setTimeout(() => this.connect(), delay);
    }

    private onMessage(raw: unknown): void {
        let msg: ServerMessage;
        try {
            msg = JSON.parse(String(raw));
        } catch {
            return;
        }

        if (isDevMode()) console.debug('[realtime]', msg);

        switch (msg.type) {
            case 'SNAPSHOT':
                this._devices.set(Object.fromEntries(
                    msg.devices.map(d => [d.device_id, toDevice(d)])));
                break;

            case 'DEVICE_STATUS': {
                const device = toDevice(msg);
                this._devices.update(map => ({ ...map, [device.deviceId]: device }));
                break;
            }

            case 'READING':
                this._reading.set(true);
                clearTimeout(this.readingTimer);
                // Red de seguridad: si no llega el resultado, no quedarse "leyendo".
                this.readingTimer = setTimeout(() => this._reading.set(false), READING_TIMEOUT_MS);
                break;

            case 'ACCESS_EVENT': {
                const event = toAccessEvent(msg);
                clearTimeout(this.readingTimer);
                this._reading.set(false);
                this._lastAccess.set(event);
                this._feed.update(f => [event, ...f].slice(0, MAX_FEED));
                break;
            }

            case 'ENROLL_STATUS': {
                // Los errores y SUCCESS también pueden llegar como ENROLL_STATUS.
                const failed = ENROLL_ERRORS.includes(msg.status);
                const done = msg.status === 'SUCCESS';
                this._enroll.set({ step: msg.status, finished: failed || done, ok: done });
                break;
            }

            case 'ENROLL_SUCCESS':
                this._enroll.set({ step: 'SUCCESS', finished: true, ok: true });
                break;

            case 'ENROLL_FAILED':
                this._enroll.set({ step: msg.status, finished: true, ok: false });
                break;
        }
    }
}