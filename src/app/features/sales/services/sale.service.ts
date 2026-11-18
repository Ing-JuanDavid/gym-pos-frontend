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


    create(
        data: SaleCreateRequest
    ) {

        return this.http.post(
            this.apiUrl,
            data
        );

    }

}