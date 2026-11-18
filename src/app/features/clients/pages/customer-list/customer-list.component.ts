import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CustomerService } from '../../services/customer.service';

import { Customer } from '../../models/customer.model';
import { CustomerEditModalComponent } from '../../components/customer-edit-modal/customer-edit-modal';
import { ClientCreateComponent } from '../../components/customer-create-modal/customer-create-modal';
@Component({
  selector: 'app-client-list',
  standalone: true,
  templateUrl: './customer-list.component.html',
  imports: [CustomerEditModalComponent, ClientCreateComponent]
})
export class CustomerListComponent implements OnInit {

  private readonly customerService =
    inject(CustomerService);

  customers =
    signal<Customer[]>([]);

  loading =
    signal(true);

  selectedCustomer = signal<Customer | null>(null);

  modalOpen = signal(false);

  ngOnInit(): void {

    this.customerService
      .getAll()
      .subscribe({
        next: customers => {

          this.customers.set(customers);

          this.loading.set(false);
        },
        error: error => {

          console.error(error);

          this.loading.set(false);
        }
      });
  }

  deleteCustomer(customer: Customer): void {

    const confirmed = confirm(
      `¿Desea eliminar a ${customer.firstName} ${customer.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.customerService
      .delete(customer.nuip)
      .subscribe({
        next: () => {

          this.customers.update(customers =>
            customers.filter(c => c.nuip !== customer.nuip)
          );

        },
        error: err => {
          console.error(err);
        }
      });
  }


  createModalOpen = signal(false);

  openCreateModal(): void {
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.createModalOpen.set(false);
  }

  createCustomer(customerData: any): void {

    this.customerService
      .create(customerData)
      .subscribe({
        next: customer => {

          this.customers.update(customers => [
            customer,
            ...customers
          ]);

          this.closeCreateModal();

          alert(customer.firstName + ' creado');
        },

        error: error => {
          console.error(error);
        }
      });
  }


  editCustomer(customer: Customer): void {

    this.selectedCustomer.set(customer);

    this.modalOpen.set(true);

  }

  saveCustomer(event: {
    nuip: number;
    data: any;
  }): void {

    this.customerService
      .update(
        event.nuip,
        event.data
      )
      .subscribe({

        next: updated => {


          this.customers.update(customers =>
            customers.map(customer =>
              customer.nuip === updated.nuip
                ? {
                  ...customer,
                  ...updated
                }
                : customer
            )
          );

          this.closeModal();
          alert(updated.firstName + " actualizado")

        },

        error: error => {
          console.error(error);
        }

      });

  }

  closeModal(): void {

    this.modalOpen.set(false);

    this.selectedCustomer.set(null);

  }
}