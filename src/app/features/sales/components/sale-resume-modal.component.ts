import {
    ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';

import { Plan } from '../../plans/models/plan.model';
import { PlanService } from '../../plans/services/plan.service';
import { Payment } from '../models/payments.model';
import { SaleResume, SaleResumeDetail } from '../models/sale.model';
import { PaymentService } from '../services/payment.service';
import { SaleService } from '../services/sale.service';

@Component({
    selector: 'app-sale-resume-modal',
    standalone: true,
    imports: [CurrencyPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './sale-resume-modal.component.html',
    host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class SaleResumeModalComponent implements OnInit {

    readonly saleId = input.required<number>();
    readonly closed = output<void>();
    /** El padre abre el modal de cobro cuando la venta tiene saldo. */
    readonly payRequested = output<void>();

    private readonly resumeService = inject(SaleService);
    private readonly paymentService = inject(PaymentService);
    private readonly planService = inject(PlanService);

    readonly resume = signal<SaleResume | null>(null);
    readonly payments = signal<Payment[]>([]);
    readonly plans = signal<Plan[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    readonly paid = computed(() => {
        const r = this.resume();
        return r ? r.total - r.pendingAmount : 0;
    });

    readonly planNames = computed(() =>
        new Map(this.plans().map(p => [p.planId, p.name])));

    ngOnInit(): void {
        forkJoin({
            resume: this.resumeService.getResume(this.saleId()),
            payments: this.paymentService.getBySale(this.saleId()),
            // Si los planes no cargan, el resumen sigue funcionando con "Plan #id".
            plans: this.planService.getAll().pipe(catchError(() => of([] as Plan[]))),
        }).subscribe({
            next: ({ resume, payments, plans }) => {
                this.resume.set(resume);
                this.payments.set(payments);
                this.plans.set(plans);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.error.set('No se pudo cargar el resumen de la venta.');
            },
        });
    }

    protected itemName(d: SaleResumeDetail): string {
        if (d.itemType === 'PLAN') {
            return this.planNames().get(d.itemId) ?? `Plan #${d.itemId}`;
        }
        return `Producto #${d.itemId}`; // aún no hay endpoint de productos en el front
    }
}