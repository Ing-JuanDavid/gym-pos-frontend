import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { CustomerService } from '../../services/customer.service';

import { Customer } from '../../models/customer.model';
import { CustomerEditModalComponent } from '../../components/customer-edit-modal/customer-edit-modal';
import { ClientCreateComponent } from '../../components/customer-create-modal/customer-create-modal';
import { CapturePhotoModalComponent } from '../../components/capture-photo-modal/capture-photo-modal.component';
import { CustomerPhotoService } from '../../services/customer-photo.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-client-list',
  standalone: true,
  templateUrl: './customer-list.component.html',
  imports: [CustomerEditModalComponent, ClientCreateComponent, CapturePhotoModalComponent, DatePipe, RouterLink]
})
export class CustomerListComponent implements OnInit {

  private readonly customerService =
    inject(CustomerService);

  private readonly photoService =
    inject(CustomerPhotoService);

  customers =
    signal<Customer[]>([]);

  loading =
    signal(true);

  searchTerm =
    signal('');

  selectedCustomer = signal<Customer | null>(null);

  modalOpen = signal(false);

  // ── Foto ──

  /** Cliente al que se le está tomando la foto (null = modal cerrado). */
  photoCustomer = signal<Customer | null>(null);

  /** Fotos tomadas en esta sesión: tienen prioridad sobre la que traiga el listado. */
  private readonly freshPhotos = signal<Record<number, string>>({});

  /** Clientes cuya imagen no cargó: se vuelve a mostrar las iniciales. */
  private readonly brokenPhotos = signal<ReadonlySet<number>>(new Set());

  filteredCustomers = computed(() => {

    const term =
      this.searchTerm()
        .trim()
        .toLowerCase();

    if (!term) {
      return this.customers();
    }

    return this.customers().filter(customer => {

      const fullName =
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase();

      const document =
        customer.nuip
          .toString();

      return (
        fullName.includes(term) ||
        document.includes(term)
      );

    });

  });


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

  openPhotoModal(customer: Customer): void {
    this.photoCustomer.set(customer);
  }

  closePhotoModal(): void {
    this.photoCustomer.set(null);
  }

  onPhotoCaptured(url: string): void {

    const customer = this.photoCustomer();

    if (!customer) {
      return;
    }

    this.freshPhotos.update(photos => ({ ...photos, [customer.nuip]: url }));

    this.brokenPhotos.update(broken => {
      const next = new Set(broken);
      next.delete(customer.nuip);
      return next;
    });
  }

  /** URL de la foto a mostrar en el avatar, o null para usar las iniciales. */
  photoFor(customer: Customer): string | null {

    if (this.brokenPhotos().has(customer.nuip)) {
      return null;
    }

    const fresh = this.freshPhotos()[customer.nuip];

    if (fresh) {
      return fresh;
    }

    return customer.photoUrl
      ? this.photoService.toAbsolute(customer.photoUrl)
      : null;
  }

  markPhotoBroken(customer: Customer): void {
    this.brokenPhotos.update(broken => new Set(broken).add(customer.nuip));
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