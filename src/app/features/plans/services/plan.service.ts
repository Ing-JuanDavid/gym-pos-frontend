import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { PlanDto, PlanCreateRequest, PlanUpdateRequest } from '../models/plan.dto';
import { Plan } from '../models/plan.model';
import { PlanMapper } from '../mapper/plan.mapper';
@Injectable({
    providedIn: 'root'
})
export class PlanService {

    private readonly http =
        inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:8000/plans';

    getAll(): Observable<Plan[]> {

        return this.http
            .get<PlanDto[]>(this.apiUrl)
            .pipe(
                map(plans =>
                    plans.map(PlanMapper.toModel)
                )
            );

    }


    update(
        planId: number,
        data: PlanUpdateRequest
    ) {

        return this.http
            .patch<PlanDto>(
                `${this.apiUrl}/${planId}`,
                data
            )
            .pipe(
                map(PlanMapper.toModel)
            );
    }

    create(
        data: PlanCreateRequest
    ) {

        return this.http
            .post<PlanDto>(
                this.apiUrl,
                data
            )
            .pipe(
                map(PlanMapper.toModel)
            );

    }

    delete(planId: number) {

        return this.http.delete<{
            message?: string;
            messaje?: string;
        }>(
            `${this.apiUrl}/${planId}`
        );

    }

}