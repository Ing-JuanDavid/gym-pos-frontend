import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

// Ajusta esta ruta y la base de la API al mismo patrón que usa tu SaleService.
import { Payment, PaymentCreateRequest } from '../models/payments.model';

/** Forma en la que responde FastAPI (snake_case). */
interface PaymentApi {
    payment_id: number;
    amount: number;
    payment_method: Payment['paymentMethod'];
    created_at: string;
    sale_id: number;
}

const toPayment = (p: PaymentApi): Payment => ({
    paymentId: p.payment_id,
    amount: p.amount,
    paymentMethod: p.payment_method,
    createdAt: p.created_at,
    saleId: p.sale_id,
});

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:8000/payments';

    /**
     * Registra un pago. `sale_id` viaja como query param porque así está
     * declarado el endpoint. La barra final evita la redirección 307.
     */
    create(saleId: number, request: PaymentCreateRequest): Observable<Payment> {
        return this.http
            .post<PaymentApi>(`${this.baseUrl}/`, {
                payment_method: request.paymentMethod,
                amount: request.amount,
            }, { params: new HttpParams().set('sale_id', saleId) })
            .pipe(map(toPayment));
    }

    /** Una venta sin pagos devuelve 404 en el backend: aquí es una lista vacía. */
    getBySale(saleId: number): Observable<Payment[]> {
        return this.http
            .get<PaymentApi[]>(`${this.baseUrl}/sale/${saleId}`)
            .pipe(
                map(list => list.map(toPayment)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
                catchError((e: HttpErrorResponse) =>
                    e.status === 404 ? of([] as Payment[]) : throwError(() => e)),
            );
    }
}