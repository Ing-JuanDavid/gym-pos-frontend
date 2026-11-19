import { AccessType } from "../../../core/realtime/realtime.model"

const REASONS: Record<string, { title: string; hint: string }> = {
    CUSTOMER_NOT_FOUND: {
        title: 'Cliente no registrado',
        hint: 'La huella existe pero no está asociada a un cliente. Avisa a administración.',
    },
    MEMBERSHIP_NOT_FOUND: {
        title: 'Sin membresía vigente',
        hint: 'Vende o renueva una membresía en el punto de venta para habilitar el acceso.',
    },
    FINGER_NOT_FOUND: {
        title: 'Huella no reconocida',
        hint: 'Limpia el dedo y vuelve a intentarlo. Si persiste, registra la huella del cliente.',
    },
};

export const reasonTitle = (reason: string | null): string =>
    (reason && REASONS[reason]?.title) || 'Acceso denegado';

export const reasonHint = (reason: string | null): string =>
    (reason && REASONS[reason]?.hint) || (reason ? `Motivo: ${reason}` : 'Consulta con administración.');

export const accessTypeLabel = (type: AccessType | null): string =>
    type === 'CHECK_OUT' ? 'Salida' : 'Entrada';