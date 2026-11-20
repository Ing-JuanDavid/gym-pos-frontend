import {
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';

import { SaleService } from '../services/sale.service';

import { Sale } from '../models/sale.model';

import { CurrencyPipe } from '@angular/common';

import { LucideWallet } from '@lucide/angular';

import { DatePipe } from '@angular/common';
import { SaleCreateModalComponent } from '../components/sale-create-modal.component';
import { SalePaymentModalComponent } from '../components/sale-payment-modal.component';
import { SaleResumeModalComponent } from '../components/sale-resume-modal.component';

import { SaleCreateRequest } from '../models/sale.dto';
import { SaleMapper } from '../mappers/sale.mapper';

type PeriodMode = 'DAY' | 'MONTH' | 'ALL';

const pad = (n: number): string => String(n).padStart(2, '0');

/** YYYY-MM-DD en hora local (no UTC, para que "hoy" sea el de Colombia). */
const dayKey = (d: Date): string =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Las fechas del backend llegan sin zona horaria: "2026-11-18T16:47:33". */
const saleDayKey = (value: string | Date): string =>
    typeof value === 'string' ? value.slice(0, 10) : dayKey(value);

@Component({
    selector: 'app-sale-list',
    standalone: true,
    templateUrl: './sale-list.component.html',
    imports: [
        CurrencyPipe, LucideWallet, DatePipe,
        SaleCreateModalComponent, SalePaymentModalComponent, SaleResumeModalComponent,
    ]
})
export class SaleListComponent implements OnInit {

    private readonly saleService =
        inject(SaleService);

    sales =
        signal<Sale[]>([]);

    loading =
        signal(true);

    search =
        signal('');

    selectedStatus =
        signal<string>('ALL');

    createModalOpen =
        signal(false);

    selectedSale =
        signal<Sale | null>(null);

    resumeSale =
        signal<Sale | null>(null);

    // ── Periodo de los KPIs ──
    // Para abrir en "todo el historial", cambia 'DAY' por 'ALL'.
    periodMode =
        signal<PeriodMode>('DAY');

    selectedDay =
        signal(dayKey(new Date()));

    selectedMonth =
        signal(dayKey(new Date()).slice(0, 7));

    readonly modes: { value: PeriodMode; label: string }[] = [
        { value: 'DAY', label: 'Día' },
        { value: 'MONTH', label: 'Mes' },
        { value: 'ALL', label: 'Todo' },
    ];


    ngOnInit(): void {
        this.loadSales();
    }

    loadSales(): void {

        this.loading.set(true);

        this.saleService
            .getAll()
            .subscribe({

                next: sales => {

                    this.sales.set(sales);

                    this.loading.set(false);

                },

                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }

            });

    }

    /** Ventas del periodo elegido: alimenta los KPIs y la tabla. */
    periodSales = computed(() => {

        const mode = this.periodMode();

        if (mode === 'ALL') {
            return this.sales();
        }

        const prefix =
            mode === 'DAY'
                ? this.selectedDay()
                : this.selectedMonth();

        if (!prefix) {
            return this.sales();
        }

        return this.sales()
            .filter(sale =>
                saleDayKey(sale.createdAt)
                    .startsWith(prefix)
            );

    });

    periodLabel = computed(() => {

        const mode = this.periodMode();

        if (mode === 'ALL') {
            return 'Todo el historial';
        }

        if (mode === 'DAY') {
            const [y, m, d] = this.selectedDay().split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString(
                'es-CO',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );
        }

        const [y, m] = this.selectedMonth().split('-').map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString(
            'es-CO',
            { month: 'long', year: 'numeric' }
        );

    });

    filteredSales = computed(() => {

        const search =
            this.search()
                .toLowerCase()
                .trim();

        const status =
            this.selectedStatus();

        return this.periodSales()
            .filter(sale => {

                const searchMatch =
                    !search ||
                    sale.nuip
                        .toString()
                        .includes(search) ||

                    sale.saleId
                        .toString()
                        .includes(search);

                const statusMatch =
                    status === 'ALL' ||
                    sale.status === status;

                return (
                    searchMatch &&
                    statusMatch
                );

            });

    });


    totalSales = computed(() =>
        this.periodSales().length
    );

    paidSales = computed(() =>
        this.periodSales()
            .filter(
                sale =>
                    sale.status === 'PAGADA'
            )
            .length
    );

    pendingSales = computed(() =>
        this.periodSales()
            .filter(
                sale =>
                    sale.status !== 'PAGADA'
            )
            .length
    );

    totalRevenue = computed(() =>
        this.periodSales()
            .reduce(
                (acc, sale) =>
                    acc + sale.total,
                0
            )
    );


    setMode(mode: PeriodMode): void {
        this.periodMode.set(mode);
    }

    onDayChange(value: string): void {
        if (value) this.selectedDay.set(value);
    }

    onMonthChange(value: string): void {
        if (value) this.selectedMonth.set(value);
    }

    /** Mueve el periodo un día o un mes hacia atrás (-1) o adelante (1). */
    shift(delta: number): void {

        if (this.periodMode() === 'DAY') {
            const [y, m, d] = this.selectedDay().split('-').map(Number);
            this.selectedDay.set(dayKey(new Date(y, m - 1, d + delta)));
            return;
        }

        const [y, m] = this.selectedMonth().split('-').map(Number);
        this.selectedMonth.set(
            dayKey(new Date(y, m - 1 + delta, 1)).slice(0, 7)
        );

    }

    goToToday(): void {
        const today = dayKey(new Date());
        this.selectedDay.set(today);
        this.selectedMonth.set(today.slice(0, 7));
    }


    openCreateModal(): void {

        this.createModalOpen.set(true);

    }
    closeCreateModal(): void {

        this.createModalOpen.set(false);

    }

    openPayment(sale: Sale): void {
        this.selectedSale.set(sale);
    }

    closePayment(): void {
        this.selectedSale.set(null);
    }

    openResume(sale: Sale): void {
        this.resumeSale.set(sale);
    }

    closeResume(): void {
        this.resumeSale.set(null);
    }

    payFromResume(): void {
        this.selectedSale.set(this.resumeSale());
        this.resumeSale.set(null);
    }


    createSale(
        request: SaleCreateRequest
    ): void {

        this.saleService
            .create(request)
            .subscribe({

                next: sale => {

                    this.closeCreateModal();

                    this.loadSales();

                    console.log(sale)

                    this.selectedSale.set(sale);

                },

                error: error => {

                    console.error(error);

                }

            });

    }
}