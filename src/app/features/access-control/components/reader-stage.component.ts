import {
    ChangeDetectionStrategy, Component, computed, effect, input, signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
    AccessEvent, DeviceView, EnrollState, LinkStatus,
} from '../../../core/realtime/realtime.model';
import { accessTypeLabel, reasonHint, reasonTitle } from './access-labels.component';

type StageView =
    | 'offline' | 'idle' | 'reading' | 'granted' | 'denied'
    | 'enroll' | 'enroll-ok' | 'enroll-error';

const RESULT_MS = 5000;

interface EnrollCopy { title: string; subtitle: string; index: number; }

/** index: paso del 0 al 2 (barra de progreso); -1 si no aplica. */
const ENROLL_COPY: Record<string, EnrollCopy> = {
    PLACE_FINGER: { index: 0, title: 'Coloca el dedo en el lector', subtitle: 'Apóyalo y mantenlo quieto.' },
    REMOVE_FINGER: { index: 1, title: 'Retira el dedo', subtitle: 'Primera captura correcta. Levanta el dedo del sensor.' },
    PLACE_AGAIN: { index: 2, title: 'Coloca el mismo dedo otra vez', subtitle: 'Usa el mismo dedo para confirmar la huella.' },
    SUCCESS: { index: 2, title: 'Huella registrada', subtitle: 'Ya puede usarla para ingresar al gimnasio.' },
    FIRST_CAPTURE_ERROR: { index: -1, title: 'No se pudo leer la huella', subtitle: 'Limpia el dedo y vuelve a intentarlo.' },
    SECOND_CAPTURE_ERROR: { index: -1, title: 'No se pudo leer la segunda captura', subtitle: 'Coloca el mismo dedo con firmeza y vuelve a intentarlo.' },
    MISMATCH: { index: -1, title: 'Las capturas no coinciden', subtitle: 'Usa el mismo dedo en las dos lecturas e inténtalo de nuevo.' },
    STORE_ERROR: { index: -1, title: 'No se pudo guardar la huella', subtitle: 'El sensor no pudo almacenarla. Intenta de nuevo o avisa a soporte.' },
};
const ENROLL_PROGRESS_FALLBACK: EnrollCopy = { index: 0, title: 'Registrando huella…', subtitle: 'Sigue las indicaciones del lector.' };
const ENROLL_ERROR_FALLBACK: EnrollCopy = { index: -1, title: 'No se pudo registrar la huella', subtitle: 'Vuelve a intentarlo.' };

@Component({
    selector: 'app-reader-stage',
    standalone: true,
    imports: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './reader-stage.component.html',
    styleUrl: './reader-stage.component.css',
})
export class ReaderStageComponent {

    readonly device = input<DeviceView | null>(null);
    readonly link = input.required<LinkStatus>();
    readonly reading = input(false);
    readonly access = input<AccessEvent | null>(null);
    /** Estado del registro de huella en curso (viene del servicio en tiempo real). */
    readonly enroll = input<EnrollState | null>(null);

    /** Resultado que se está mostrando (se apaga solo a los 5 s). */
    protected readonly shown = signal<AccessEvent | null>(null);

    protected readonly enrollInfo = computed(() => {
        const e = this.enroll();
        if (!e?.step) return null;

        if (e.finished && !e.ok) {
            return { kind: 'enroll-error' as const, ...(ENROLL_COPY[e.step] ?? ENROLL_ERROR_FALLBACK) };
        }
        if (e.finished && e.ok) {
            return { kind: 'enroll-ok' as const, ...ENROLL_COPY['SUCCESS'] };
        }
        return { kind: 'enroll' as const, ...(ENROLL_COPY[e.step] ?? ENROLL_PROGRESS_FALLBACK) };
    });

    protected readonly stepIndex = computed(() => this.enrollInfo()?.index ?? 0);

    protected readonly view = computed<StageView>(() => {
        const ev = this.shown();
        if (ev) return ev.granted ? 'granted' : 'denied';
        const enroll = this.enrollInfo();
        if (enroll) return enroll.kind;
        if (this.reading()) return 'reading';
        return this.device()?.state === 'online' ? 'idle' : 'offline';
    });

    protected readonly connection = computed(() => {
        if (this.link() !== 'open') return { dot: 'bg-amber-400', text: 'Verificando conexión…' };
        return this.device()?.state === 'online'
            ? { dot: 'bg-emerald-400', text: 'Dispositivo conectado' }
            : { dot: 'bg-red-400', text: 'Dispositivo desconectado' };
    });

    protected readonly copy = computed(() => {
        const enroll = this.enrollInfo();
        if (this.view() === 'enroll' && enroll) {
            return { eyebrow: 'Registro de huella', title: enroll.title, subtitle: enroll.subtitle };
        }
        switch (this.view()) {
            case 'reading':
                return {
                    eyebrow: 'Validando',
                    title: 'Mantén el dedo quieto',
                    subtitle: 'Estamos verificando tu huella…',
                };
            case 'offline':
                return {
                    eyebrow: 'Sin conexión',
                    title: 'Lector no disponible',
                    subtitle: this.link() !== 'open'
                        ? 'Conectando con el servidor…'
                        : 'Revisa que el dispositivo esté encendido y conectado a la red.',
                };
            default:
                return {
                    eyebrow: 'Listo para validar',
                    title: 'Coloca tu dedo en el lector',
                    subtitle: 'La validación se realizará automáticamente.',
                };
        }
    });

    protected readonly name = computed(() =>
        this.shown()?.customer?.fullName.trim() || 'Cliente');

    protected readonly initials = computed(() =>
        this.name().split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase());

    /** Días que le quedan a la membresía; null si no hay dato. */
    protected readonly daysLeft = computed(() => {
        const end = this.shown()?.membershipEnd;
        if (!end) return null;
        const date = new Date(end.length === 10 ? `${end}T23:59:59` : end);
        return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
    });

    protected readonly typeLabel = accessTypeLabel;
    protected readonly reasonTitle = reasonTitle;
    protected readonly reasonHint = reasonHint;

    private skipFirst = true;

    constructor() {
        effect(onCleanup => {
            const ev = this.access();

            // El servicio recuerda el último acceso: al abrir la pantalla no lo repitas.
            if (this.skipFirst) {
                this.skipFirst = false;
                return;
            }
            if (!ev) return;

            this.shown.set(ev);
            const timer = setTimeout(() => this.shown.set(null), RESULT_MS);
            onCleanup(() => clearTimeout(timer));
        });
    }
}