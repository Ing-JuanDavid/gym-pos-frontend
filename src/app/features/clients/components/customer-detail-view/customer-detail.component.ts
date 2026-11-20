import {
    Component,
    OnInit,
    inject,
    signal
} from '@angular/core';

import {
    ActivatedRoute,
    RouterLink
} from '@angular/router';

import {
    CurrencyPipe,
    DatePipe
} from '@angular/common';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

import { CustomerPhotoService } from '../../services/customer-photo.service';

@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [
        RouterLink,
        DatePipe
    ],
    templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent implements OnInit {

    private readonly route =
        inject(ActivatedRoute);

    private readonly customerService =
        inject(CustomerService);

    private readonly photoService =
        inject(CustomerPhotoService);

    customer =
        signal<Customer | null>(null);

    loading =
        signal(true);

    ngOnInit(): void {

        const nuip =
            Number(
                this.route.snapshot.paramMap.get(
                    'nuip'
                )
            );

        if (!nuip) {
            return;
        }

        this.customerService
            .getByNuip(nuip)
            .subscribe({

                next: customer => {

                    this.customer.set(customer);

                    this.loading.set(false);

                },

                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }

            });

    }


    /** URL de la foto a mostrar en el avatar, o null para usar las iniciales. */
    photoFor(customer: Customer): string | null {

        return customer.photoUrl
            ? this.photoService.toAbsolute(customer.photoUrl)
            : null;
    }


}