import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Sale } from '../models/sale.model';
import { Payment, PaymentMethod } from '../models/payments.model';
import { PaymentService } from '../services/payment.service';

@Component({
    selector: 'app-sale-payment-modal',
    standalone: true,
    imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './sale-payment-modal.component.html',
    host: { '(document:keydown.escape)': 'close()' },
})
export class SalePaymentModalComponent implements OnInit {

    readonly sale = input.required<Sale>();
    readonly closed = output<void>();
    /** Se emite tras cada pago para que la lista de ventas se recargue. */
    readonly paymentsChanged = output<void>();

    private readonly paymentService = inject(PaymentService);
    private readonly fb = inject(FormBuilder);

    readonly methods: { value: PaymentMethod; label: string }[] = [
        { value: 'EFECTIVO', label: 'Efectivo' },
        { value: 'TRANSFERENCIA', label: 'Transferencia' },
    ];

    readonly payments = signal<Payment[]>([]);
    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly errorMessage = signal<string | null>(null);

    // El backend calcula el saldo con la misma fórmula: total - suma(pagos).
    readonly paid = computed(() => this.payments().reduce((s, p) => s + p.amount, 0));
    readonly balance = computed(() => Math.max(this.sale().total - this.paid(), 0));
    readonly progress = computed(() =>
        Math.min(100, Math.round((this.paid() / this.sale().total) * 100)));
    readonly isPaid = computed(() => !this.loading() && this.balance() === 0);

    readonly form = this.fb.nonNullable.group({
        paymentMethod: ['EFECTIVO' as PaymentMethod],
        amount: [0, [Validators.required, Validators.min(1)]],
        received: [0], // solo para calcular el cambio; no se envía al backend
    });

    protected readonly method = toSignal(this.form.controls.paymentMethod.valueChanges,
        { initialValue: 'EFECTIVO' as PaymentMethod });
    protected readonly amount = toSignal(this.form.controls.amount.valueChanges, { initialValue: 0 });
    protected readonly received = toSignal(this.form.controls.received.valueChanges, { initialValue: 0 });

    readonly amountTooHigh = computed(() => (this.amount() ?? 0) > this.balance());
    readonly change = computed(() =>
        this.method() === 'EFECTIVO' && this.received() > this.amount()
            ? this.received() - this.amount() : 0);
    readonly missing = computed(() =>
        this.method() === 'EFECTIVO' && this.received() > 0 && this.received() < this.amount()
            ? this.amount() - this.received() : 0);
    readonly canPay = computed(() =>
        !this.loading() && !this.saving() && this.balance() > 0 &&
        this.amount() > 0 && !this.amountTooHigh());

    ngOnInit(): void {
        this.load();
    }

    protected selectMethod(method: PaymentMethod): void {
        this.form.controls.paymentMethod.setValue(method);
    }

    protected payFullBalance(): void {
        this.form.controls.amount.setValue(this.balance());
    }

    protected pay(): void {
        if (!this.canPay()) return;

        this.saving.set(true);
        this.errorMessage.set(null);

        const { paymentMethod, amount } = this.form.getRawValue();

        this.paymentService.create(this.sale().saleId, { paymentMethod, amount }).subscribe({
            next: () => {
                this.saving.set(false);
                this.paymentsChanged.emit();
                this.load();
            },
            error: (e: HttpErrorResponse) => {
                this.saving.set(false);
                this.errorMessage.set(
                    typeof e.error?.detail === 'string'
                        ? e.error.detail
                        : 'No se pudo registrar el pago. Intenta de nuevo.');
            },
        });
    }

    protected close(): void {
        if (!this.saving()) this.closed.emit();
    }

    private load(): void {
        this.paymentService.getBySale(this.sale().saleId).subscribe({
            next: payments => {
                this.payments.set(payments);
                this.loading.set(false);
                this.form.patchValue({ amount: this.balance(), received: 0 });
            },
            error: () => {
                this.loading.set(false);
                this.errorMessage.set('No se pudieron cargar los pagos de la venta.');
            },
        });
    }
}