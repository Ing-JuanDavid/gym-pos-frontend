import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Observable,
    map
} from 'rxjs';

import { MembershipDetailDto } from '../models/membership.dto';
import { MembershipDetail } from '../models/membership.model';
import { MembershipMapper } from '../mapper/membership.mapper';

@Injectable({
    providedIn: 'root'
})
export class MembershipService {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:8000/memberships';

    getAll(
        active?: boolean
    ): Observable<MembershipDetail[]> {

        let url = this.apiUrl;

        if (active !== undefined) {
            url += `?active=${active}`;
        }

        return this.http
            .get<MembershipDetailDto[]>(url)
            .pipe(
                map(memberships =>
                    memberships.map(
                        MembershipMapper.toModelDetail
                    )
                )
            );

    }



    getByCustomer(
        nuip: number,
        active?: boolean
    ): Observable<MembershipDetail[]> {

        let url =
            `${this.apiUrl}/customer/${nuip}`;

        if (active !== undefined) {
            url += `?active=${active}`;
        }

        return this.http
            .get<MembershipDetailDto[]>(url)
            .pipe(
                map(memberships =>
                    memberships.map(
                        MembershipMapper.toModelDetail
                    )
                )
            );

    }

}