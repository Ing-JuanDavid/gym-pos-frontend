import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';



export interface CapturedPhoto {
    message: string;
    customerNuip: number;
    photoId: number;
    /** URL ya completa, lista para un <img>. */
    url: string;
}

interface CapturedPhotoApi {
    message: string;
    customer_nuip: number;
    photo_id: number;
    url: string; // el backend responde "/media/captures/archivo.jpg"
}

@Injectable({ providedIn: 'root' })
export class CustomerPhotoService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:8000/capture';

    /**
     * Origen del servidor ("http://localhost:8000"), SIN ninguna ruta. Las fotos
     * cuelgan de /media en la raíz del servidor, no de /capture ni de otro endpoint.
     */
    private readonly origin = 'http://localhost:8000';

    /**
     * Pide la foto al ESP32-CAM. El backend espera el JPEG (hasta ~15 s), lo guarda
     * como foto del cliente y responde: cuando llega la respuesta, la foto ya existe.
     */
    capture(customerNuip: number, deviceId: string): Observable<CapturedPhoto> {
        return this.http
            .post<CapturedPhotoApi>(`${this.apiUrl}`, {
                customer_nuip: customerNuip,
                device_id: deviceId,
            })
            .pipe(map(r => ({
                message: r.message,
                customerNuip: r.customer_nuip,
                photoId: r.photo_id,
                url: this.toAbsolute(r.url),
            })));
    }

    /** Convierte "/media/..." en "http://host:8000/media/...". */
    toAbsolute(url: string): string {
        if (/^https?:\/\//.test(url)) return url;
        return `${this.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
}

/** Traduce los errores del backend a mensajes para recepción. */
export function captureErrorMessage(e: HttpErrorResponse): string {
    if (e.status === 0) return 'No hay conexión con el servidor.';

    const detail: string = typeof e.error?.detail === 'string' ? e.error.detail : '';
    const d = detail.toLowerCase();

    if (d.includes('desconectado')) return 'La cámara está desconectada.';
    if (d.includes('a tiempo')) return 'La cámara no respondió a tiempo. Inténtalo de nuevo.';
    if (d.includes('en curso')) return 'Ya hay una captura en curso. Espera un momento.';
    if (d.includes('jpeg')) return 'La imagen recibida no es válida. Inténtalo de nuevo.';
    if (d.includes('no pudo capturar')) return detail;
    if (e.status === 404) return 'No se encontró el cliente.';

    return detail || `No se pudo tomar la foto (error ${e.status}).`;
}