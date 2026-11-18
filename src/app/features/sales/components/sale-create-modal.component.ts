import {
    Component,
    EventEmitter,
    Input,
    Output,
    signal,
    inject
} from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SaleCreateRequest } from '../models/sale.dto';

import { CurrencyPipe } from '@angular/common';
import { CustomerService } from '../../clients/services/customer.service';
import { Customer } from '../../clients/models/customer.model';
import { Plan } from '../../plans/models/plan.model';
import { PlanService } from '../../plans/services/plan.service';


interface CartItem {
    itemId: number;
    itemType: 'PLAN' | 'PRODUCTO';

    name: string;

    quantity: number;

    unitPrice: number;
}

@Component({
    selector: 'app-sale-create-modal',
    imports: [CurrencyPipe, FormsModule,
        ReactiveFormsModule],
    standalone: true,
    templateUrl: './sale-create-modal.component.html'
})
export class SaleCreateModalComponent {

    @Input()
    open = false;

    @Output()
    close =
        new EventEmitter<void>();

    @Output()
    save =
        new EventEmitter<SaleCreateRequest>();

    cart =
        signal<CartItem[]>([]);

    customerNuip = '';

    private readonly customerService =
        inject(CustomerService);

    private readonly planService =
        inject(PlanService);

    selectedCustomer =
        signal<Customer | null>(null);

    searchingCustomer =
        signal(false);

    plans = signal<Plan[]>([]);

    products = signal([
        {
            id: 1,
            name: 'Shaker',
            price: 35000
        },
        {
            id: 2,
            name: 'Agua',
            price: 3500
        }
    ]);

    ngOnChanges(): void {

        if (this.open) {

            this.loadPlans();

        }

    }

    addPlan(
        plan: any
    ): void {


        this.cart.update(cart => [
            ...cart,
            {
                itemId: plan.planId,
                itemType: 'PLAN',
                name: plan.name,
                quantity: 1,
                unitPrice: plan.amount
            }
        ]);

    }

    addProduct(
        product: any
    ): void {

        this.cart.update(cart => [
            ...cart,
            {
                itemId: product.id,
                itemType: 'PRODUCTO',
                name: product.name,
                quantity: 1,
                unitPrice: product.price
            }
        ]);

    }

    removeItem(
        index: number
    ): void {

        this.cart.update(items =>
            items.filter(
                (_, i) => i !== index
            )
        );

    }

    getTotal(): number {

        return this.cart()
            .reduce(
                (total, item) =>
                    total +
                    item.unitPrice *
                    item.quantity,
                0
            );

    }

    onClose(): void {
        this.close.emit();
    }


    searchCustomer(): void {

        if (!this.customerNuip.trim()) {
            return;
        }

        this.searchingCustomer.set(true);

        this.customerService
            .getByNuip(
                Number(this.customerNuip)
            )
            .subscribe({

                next: customer => {

                    this.selectedCustomer.set(
                        customer
                    );

                    this.searchingCustomer.set(false);

                },

                error: error => {

                    console.error(error);

                    this.selectedCustomer.set(null);

                    this.searchingCustomer.set(false);

                    alert(
                        'Cliente no encontrado'
                    );

                }

            });

    }

    loadPlans(): void {

        this.planService
            .getAll()
            .subscribe({

                next: plans => {

                    this.plans.set(plans);

                },

                error: error => {

                    console.error(error);

                }

            });

    }

    createSale(): void {

        const customer =
            this.selectedCustomer();

        if (!customer) {
            return;
        }

        const details =
            this.cart().map(item => ({
                item_id: item.itemId,
                item_type: item.itemType,
                quantity: item.quantity
            }));

        console.log(details)

        this.save.emit({

            nuip: customer.nuip,

            details

        });

    }

}