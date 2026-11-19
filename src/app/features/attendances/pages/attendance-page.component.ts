import {
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendanceService } from '../services/attendance.service';
import { Attendance } from '../models/attendance.model';

type ViewMode = 'DAY' | 'MONTH' | 'ALL';

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './attendance.component.html'
})
export class AttendancePageComponent implements OnInit {

    private readonly attendanceService = inject(
        AttendanceService
    );

    readonly attendances = signal<Attendance[]>([]);

    readonly loading = signal(false);

    readonly search = signal('');

    readonly selectedView = signal<ViewMode>('DAY');

    readonly selectedDate = signal(
        new Date()
    );

    ngOnInit(): void {
        this.loadAttendances();
    }

    readonly filteredAttendances = computed(() => {

        let attendances = [...this.attendances()];

        const searchTerm = this.search()
            .trim();

        const selectedDate = this.selectedDate();

        // Buscar por documento
        if (searchTerm) {

            attendances = attendances.filter(
                attendance =>
                    attendance.nuip
                        .toString()
                        .includes(searchTerm)
            );

        }

        // Filtrar por periodo
        switch (this.selectedView()) {

            case 'DAY':

                attendances = attendances.filter(
                    attendance => {

                        const date = new Date(
                            attendance.checkIn
                        );

                        return (
                            date.getFullYear() === selectedDate.getFullYear() &&
                            date.getMonth() === selectedDate.getMonth() &&
                            date.getDate() === selectedDate.getDate()
                        );

                    }
                );

                break;

            case 'MONTH':

                attendances = attendances.filter(
                    attendance => {

                        const date = new Date(
                            attendance.checkIn
                        );

                        return (
                            date.getFullYear() === selectedDate.getFullYear() &&
                            date.getMonth() === selectedDate.getMonth()
                        );

                    }
                );

                break;

            case 'ALL':

                break;

        }

        return attendances;

    });

    readonly totalAttendances = computed(
        () => this.filteredAttendances().length
    );

    readonly activeAttendances = computed(
        () =>
            this.filteredAttendances().filter(
                attendance =>
                    attendance.status === 'ACTIVE'
            ).length
    );

    readonly finishedAttendances = computed(
        () =>
            this.filteredAttendances().filter(
                attendance =>
                    attendance.status === 'FINISHED'
            ).length
    );

    loadAttendances(): void {

        this.loading.set(true);

        this.attendanceService
            .getAttendances()
            .subscribe({
                next: attendances => {

                    this.attendances.set(
                        attendances
                    );

                    this.loading.set(false);

                },
                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }
            });

    }

    processAttendance(
        value: string
    ): void {

        const nuip = Number(value);

        if (!nuip) {
            return;
        }

        const activeAttendance =
            this.attendances().find(
                attendance =>
                    attendance.nuip === nuip &&
                    attendance.status === 'ACTIVE'
            );

        if (activeAttendance) {

            this.attendanceService
                .checkOut(nuip)
                .subscribe({
                    next: () =>
                        this.loadAttendances(),
                    error: error =>
                        console.error(error)
                });

            return;

        }

        this.attendanceService
            .checkIn(nuip)
            .subscribe({
                next: () =>
                    this.loadAttendances(),
                error: error =>
                    console.error(error)
            });

    }

    deleteAttendance(
        attendance: Attendance
    ): void {

        const confirmed = confirm(
            `¿Desea eliminar la asistencia #${attendance.attendanceId}?`
        );

        if (!confirmed) {
            return;
        }

        this.attendanceService
            .deleteAttendance(
                attendance.attendanceId
            )
            .subscribe({
                next: () =>
                    this.loadAttendances(),
                error: error =>
                    console.error(error)
            });

    }

    setView(
        view: ViewMode
    ): void {

        this.selectedView.set(view);

    }

    previousDate(): void {

        const date = new Date(
            this.selectedDate()
        );

        if (
            this.selectedView() === 'MONTH'
        ) {

            date.setMonth(
                date.getMonth() - 1
            );

        } else {

            date.setDate(
                date.getDate() - 1
            );

        }

        this.selectedDate.set(date);

    }

    nextDate(): void {

        const date = new Date(
            this.selectedDate()
        );

        if (
            this.selectedView() === 'MONTH'
        ) {

            date.setMonth(
                date.getMonth() + 1
            );

        } else {

            date.setDate(
                date.getDate() + 1
            );

        }

        this.selectedDate.set(date);

    }

    goToToday(): void {

        this.selectedDate.set(
            new Date()
        );

    }

    updateDate(
        event: Event
    ): void {

        const value =
            (event.target as HTMLInputElement)
                .value;

        if (!value) {
            return;
        }

        this.selectedDate.set(
            new Date(value)
        );

    }

    readonly currentPeriodLabel = computed(() => {

        const date = this.selectedDate();

        if (
            this.selectedView() === 'DAY'
        ) {

            return date.toLocaleDateString(
                'es-CO',
                {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }
            );

        }

        if (
            this.selectedView() === 'MONTH'
        ) {

            return date.toLocaleDateString(
                'es-CO',
                {
                    month: 'long',
                    year: 'numeric'
                }
            );

        }

        return 'Todo el historial';

    });

}