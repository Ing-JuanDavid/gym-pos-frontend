import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Attendance } from '../models/attendance.model';
import { AttendanceMapper } from '../mappers/attendance.mapper';
import { AttendanceDto } from '../models/attendance.dto';

@Injectable({
    providedIn: 'root'
})
export class AttendanceService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = 'http://localhost:8000/attendances';

    getAttendances(): Observable<Attendance[]> {
        return this.http.get<AttendanceDto[]>(this.apiUrl).pipe(
            map(attendances =>
                attendances.map(AttendanceMapper.toModel)
            )
        );
    }

    deleteAttendance(attendanceId: number): Observable<boolean> {
        return this.http.delete<boolean>(
            `${this.apiUrl}/${attendanceId}`
        );
    }

    checkIn(nuip: number) {
        return this.http.post(
            `${this.apiUrl}/customer/${nuip}/checkin`,
            {}
        );
    }

    checkOut(nuip: number) {
        return this.http.patch(
            `${this.apiUrl}/customer/${nuip}/checkout`,
            {}
        );
    }
}