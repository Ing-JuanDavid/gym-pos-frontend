import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
    Observable,
    map
} from 'rxjs';

import { SaleDto } from '../models/sale.dto';
import { Sale } from '../models/sale.model';

import { SaleCreateRequest } from '../models/sale.dto';

import { SaleMapper } from '../mappers/sale.mapper';

import { SaleResume, ResumeStatus } from '../models/sale.model';

interface SaleResumeApi {
    sale_id: number;
    nuip: number;
    total: number;
    created_at: string;
    status: ResumeStatus;
    pending_amout: number; // el typo "amout" viene del backend
    details: {
        id: number;
        sale_id: number;
        item_id: number;
        item_type: 'PLAN' | 'PRODUCTO';
        quantity: number;
        unit_price: number;
    }[];
}
@Injectable({
    providedIn: 'root'
})
export class SaleService {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:8000/sales';

    getAll(): Observable<Sale[]> {

        return this.http
            .get<SaleDto[]>(this.apiUrl)
            .pipe(
                map(sales =>
                    sales.map(
                        SaleMapper.toModel
                    )
                )
            );

    }

    getResume(saleId: number): Observable<SaleResume> {
        return this.http.get<SaleResumeApi>(`${this.apiUrl}/${saleId}/resume`).pipe(
            map(r => ({
                saleId: r.sale_id,
                nuip: r.nuip,
                total: r.total,
                createdAt: r.created_at,
                status: r.status,
                pendingAmount: r.pending_amout,
                details: r.details.map(d => ({
                    id: d.id,
                    saleId: d.sale_id,
                    itemId: d.item_id,
                    itemType: d.item_type,
                    quantity: d.quantity,
                    unitPrice: d.unit_price,
                })),
            })),
        );
    }


    create(
        data: SaleCreateRequest
    ): Observable<Sale> {

        return this.http.post<Sale>(
            this.apiUrl,
            data
        );

    }

}