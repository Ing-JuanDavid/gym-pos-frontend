import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';

import { Customer } from '../../clients/models/customer.model';
import { CustomerService } from '../../clients/services/customer.service';

@Component({
    selector: 'app-enroll-fingerprint-modal',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './enroll-fingerprint-modal.component.html',
    host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class EnrollFingerprintModalComponent {

    readonly closed = output<void>();
    /** La página inicia el registro: la petición debe sobrevivir al cierre del modal. */
    readonly started = output<Customer>();

    private readonly customerService = inject(CustomerService);

    protected readonly nuip = signal('');
    protected readonly searching = signal(false);
    protected readonly customer = signal<Customer | null>(null);
    protected readonly error = signal<string | null>(null);

    protected onInput(value: string): void {
        this.nuip.set(value);
        this.customer.set(null); // si cambia el documento, el cliente ya no es válido
        this.error.set(null);
    }

    protected search(): void {
        const value = this.nuip().trim();

        if (!/^\d+$/.test(value)) {
            this.error.set('Escribe solo los números del documento.');
            return;
        }

        this.searching.set(true);
        this.error.set(null);
        this.customer.set(null);

        this.customerService.getByNuip(Number(value)).subscribe({
            next: customer => {
                this.customer.set(customer);
                this.searching.set(false);
            },
            error: () => {
                this.searching.set(false);
                this.error.set('No se encontró un cliente con ese documento.');
            },
        });
    }

    protected start(): void {
        const customer = this.customer();
        if (customer) this.started.emit(customer);
    }
}