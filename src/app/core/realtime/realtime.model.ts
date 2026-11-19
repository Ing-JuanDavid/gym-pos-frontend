// ───────────── Dominio (lo que usa la UI, en camelCase) ─────────────

export type DeviceKind = 'biometric' | 'camera';
export type AccessType = 'CHECK_IN' | 'CHECK_OUT';

/** Motivos conocidos; el backend puede enviar otros, por eso el campo es string. */
export type KnownDenyReason =
    | 'CUSTOMER_NOT_FOUND'
    | 'MEMBERSHIP_NOT_FOUND'
    | 'FINGER_NOT_FOUND';

export type EnrollStep =
    | 'PLACE_FINGER' | 'REMOVE_FINGER' | 'PLACE_AGAIN' | 'SUCCESS'
    | 'FIRST_CAPTURE_ERROR' | 'SECOND_CAPTURE_ERROR' | 'MISMATCH' | 'STORE_ERROR';

/** Estado de la conexión navegador ↔ API (no del ESP). */
export type LinkStatus = 'connecting' | 'open' | 'reconnecting';

/** 'unknown' cuando el navegador perdió la conexión con la API. */
export type DeviceState = 'online' | 'offline' | 'unknown';

export interface DeviceInfo {
    deviceId: string;
    kind: DeviceKind;
    online: boolean;
    lastSeen: Date | null;
}

export interface DeviceView extends Omit<DeviceInfo, 'online'> {
    state: DeviceState;
}

export interface AccessEvent {
    id: string;
    at: Date;
    deviceId: string;
    granted: boolean;
    accessType: AccessType | null;
    reason: string | null;
    customer: { nuip: number; fullName: string; photoUrl: string | null } | null;
    membershipEnd: string | null;
}

export interface EnrollState {
    step: EnrollStep | null;
    finished: boolean;
    ok: boolean;
}

// ───────────── Mensajes del servidor (snake_case, tal cual llegan) ─────────────

export interface DeviceDto {
    device_id: string;
    kind: DeviceKind;
    online: boolean;
    last_seen: string | null;
}

export interface AccessEventDto {
    id: string;
    at: string;
    device_id: string;
    granted: boolean;
    access_type: AccessType | null;
    reason: string | null;
    customer: { nuip: number; full_name: string; photo_url: string | null } | null;
    membership_end: string | null;
}

export type ServerMessage =
    | { type: 'SNAPSHOT'; devices: DeviceDto[] }
    | ({ type: 'DEVICE_STATUS' } & DeviceDto)
    | { type: 'READING'; device_id: string }
    | ({ type: 'ACCESS_EVENT' } & AccessEventDto)
    | { type: 'ENROLL_STATUS'; device_id: string; status: EnrollStep }
    | { type: 'ENROLL_SUCCESS'; device_id: string }
    | { type: 'ENROLL_FAILED'; device_id: string; status: EnrollStep };