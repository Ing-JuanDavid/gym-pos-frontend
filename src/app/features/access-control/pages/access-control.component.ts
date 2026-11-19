import {
    ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, isDevMode, signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { RealtimeService } from '../../../core/realtime/realtime.service';
import { DeviceKind, DeviceState, DeviceView } from '../../../core/realtime/realtime.model';
import { AccessHistoryModalComponent } from '../components/access-history-modal.component';
import { ReaderStageComponent } from '../components/reader-stage.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Customer } from '../../clients/models/customer.model';
import { enrollErrorMessage, FingerprintService } from '../../fingerprints/fingerprints.service';
import { EnrollFingerprintModalComponent } from '../components/enroll-fingerprint-modal.component';
/** Fecha local sin zona horaria, como la envía el backend. */
const localIso = (): string =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 19);

@Component({
    selector: 'app-access-control-page',
    standalone: true,
    imports: [DatePipe, ReaderStageComponent, AccessHistoryModalComponent, EnrollFingerprintModalComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './access-control.page.html',
})
export class AccessControlPage {

    protected readonly realtime = inject(RealtimeService);

    /** La barra de demostración solo existe con `ng serve`, no en producción. */
    protected readonly dev = isDevMode();

    protected readonly historyOpen = signal(false);
    private readonly now = signal(new Date());

    protected readonly dateLabel = computed(() =>
        this.now().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' }));

    /** Solo eventos de hoy (la pantalla puede quedar abierta pasada la medianoche). */
    protected readonly todayFeed = computed(() => {
        const today = this.now().toDateString();
        return this.realtime.feed().filter(e => e.at.toDateString() === today);
    });

    protected readonly entriesToday = computed(() =>
        this.todayFeed().filter(e => e.granted && e.accessType === 'CHECK_IN').length);

    protected readonly lastEvent = computed(() => this.todayFeed()[0] ?? null);

    protected readonly rows = computed<
        { key: DeviceKind; title: string; model: string; device: DeviceView | null }[]
    >(() => [
        { key: 'biometric', title: 'Lector biométrico', model: 'ESP32', device: this.realtime.biometric() },
        { key: 'camera', title: 'Cámara de acceso', model: 'ESP32-CAM', device: this.realtime.camera() },
    ]);

    constructor() {
        const tick = setInterval(() => this.now.set(new Date()), 30_000);
        inject(DestroyRef).onDestroy(() => clearInterval(tick));

        // Un registro terminado antes de abrir la pantalla no debe mostrarse.
        if (this.realtime.enroll()?.finished) this.realtime.clearEnroll();

        // El resultado del registro (éxito o error) se muestra 5 s y se limpia.
        effect(onCleanup => {
            if (!this.realtime.enroll()?.finished) return;
            const timer = setTimeout(() => this.realtime.clearEnroll(), 5000);
            onCleanup(() => clearTimeout(timer));
        });
    }

    protected rowState(device: DeviceView | null): DeviceState {
        if (this.realtime.link() !== 'open') return 'unknown';
        return device?.state ?? 'offline';
    }

    protected stateLabel(state: DeviceState): string {
        return { online: 'En línea', offline: 'Sin conexión', unknown: 'Verificando' }[state];
    }

    // ── Demostración (solo desarrollo) ──

    protected simulateReading(): void {
        // this.realtime.simulate({ type: 'READING', device_id: 'esp-32' });
        // setTimeout(() => this.simulateAccess(true), 1500);
    }

    protected simulateAccess(granted: boolean): void {
        // this.realtime.simulate({
        //     type: 'ACCESS_EVENT',
        //     id: crypto.randomUUID(),
        //     at: localIso(),
        //     device_id: 'esp-32',
        //     granted,
        //     access_type: granted ? 'CHECK_IN' : null,
        //     reason: granted ? null : 'MEMBERSHIP_NOT_FOUND',
        //     customer: { nuip: 1064602258, full_name: 'Cliente de prueba', photo_url: null },
        //     membership_end: null,
        // });
    }


    private readonly fingerprints = inject(FingerprintService);

    protected readonly enrollOpen = signal(false);
    protected readonly enrolling = signal(false);
    protected readonly enrollResult = signal<{ kind: 'ok' | 'error'; text: string } | null>(null);

    protected readonly readerOnline = computed(() => this.realtime.biometric()?.state === 'online');
    protected readonly canEnroll = computed(() => this.readerOnline() && !this.enrolling());

    protected startEnroll(customer: Customer): void {
        const device = this.realtime.biometric();
        if (!device || this.enrolling()) return;

        this.enrollOpen.set(false);
        this.enrolling.set(true);
        this.enrollResult.set(null);
        this.realtime.clearEnroll();

        const name = `${customer.firstName} ${customer.lastName}`.trim();

        // La petición queda abierta hasta que el lector termina; los pasos se pintan
        // en la tarjeta con los eventos del WebSocket.
        this.fingerprints.enroll(Number(customer.nuip), device.deviceId).subscribe({
            next: () => {
                this.enrolling.set(false);
                this.showEnrollResult('ok', `Huella registrada para ${name}.`);
            },
            error: (e: HttpErrorResponse) => {
                this.enrolling.set(false);
                // Si el fallo vino del lector, la tarjeta ya lo muestra y se limpia sola.
                if (!this.realtime.enroll()?.finished) this.realtime.clearEnroll();
                this.showEnrollResult('error', enrollErrorMessage(e));
            },
        });
    }

    private showEnrollResult(kind: 'ok' | 'error', text: string): void {
        this.enrollResult.set({ kind, text });
        if (kind === 'ok') {
            setTimeout(() => this.enrollResult.update(r => (r?.text === text ? null : r)), 8000);
        }
    }
}