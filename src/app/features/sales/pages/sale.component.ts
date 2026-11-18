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

import { SaleCreateRequest } from '../models/sale.dto';

@Component({
    selector: 'app-sale-list',
    standalone: true,
    templateUrl: './sale-list.component.html',
    imports: [CurrencyPipe, LucideWallet, DatePipe, SaleCreateModalComponent]
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

    filteredSales = computed(() => {

        const search =
            this.search()
                .toLowerCase()
                .trim();

        const status =
            this.selectedStatus();

        return this.sales()
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
        this.sales().length
    );

    paidSales = computed(() =>
        this.sales()
            .filter(
                sale =>
                    sale.status === 'PAGADA'
            )
            .length
    );

    pendingSales = computed(() =>
        this.sales()
            .filter(
                sale =>
                    sale.status !== 'PAGADA'
            )
            .length
    );

    totalRevenue = computed(() =>
        this.sales()
            .reduce(
                (acc, sale) =>
                    acc + sale.total,
                0
            )
    );


    openCreateModal(): void {

        this.createModalOpen.set(true);

    }
    closeCreateModal(): void {

        this.createModalOpen.set(false);

    }


    createSale(
        sale: SaleCreateRequest
    ): void {

        this.saleService
            .create(sale)
            .subscribe({

                next: () => {

                    this.closeCreateModal();

                    this.loadSales();

                },

                error: error => {

                    console.error(error);

                }

            });

    }
}