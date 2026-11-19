import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
// ajusta la ruta

export interface EnrollFingerprintResult {
    message: string;
    customerNuip: number;
    fingerprintId: number;
}

interface EnrollFingerprintApi {
    message: string;
    customer_nuip: number;
    fingerprint_id: number;
}

@Injectable({ providedIn: 'root' })
export class FingerprintService {

    private readonly http = inject(HttpClient);

    private baseUrl = `http://localhost:8000/fingerprint`;

    /** La petición queda abierta hasta que el ESP termina o falla (puede tardar ~20-40 s). */
    enroll(customerNuip: number, deviceId: string): Observable<EnrollFingerprintResult> {
        return this.http
            .post<EnrollFingerprintApi>(this.baseUrl, {
                customer_nuip: customerNuip,
                device_id: deviceId,
            })
            .pipe(map(r => ({
                message: r.message,
                customerNuip: r.customer_nuip,
                fingerprintId: r.fingerprint_id,
            })));
    }
}

/** Traduce los errores del backend a mensajes para recepción. */
export function enrollErrorMessage(e: HttpErrorResponse): string {
    if (e.status === 0) return 'No hay conexión con el servidor.';

    const detail: string = typeof e.error?.detail === 'string' ? e.error.detail : '';
    const d = detail.toLowerCase();

    if (d.includes('already enrolled')) return 'Este cliente ya tiene una huella registrada.';
    if (d.includes('desconectado')) return 'El lector está desconectado.';
    if (d.includes('a tiempo')) return 'El lector no respondió a tiempo. Inténtalo de nuevo.';
    if (d.includes('en curso')) return 'Ya hay un registro en curso. Espera a que termine.';
    if (e.status === 404) return 'No se encontró el cliente.';

    return detail || `No se pudo registrar la huella (error ${e.status}).`;
}