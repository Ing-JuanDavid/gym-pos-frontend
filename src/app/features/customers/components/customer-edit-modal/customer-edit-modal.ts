import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { Customer } from '../../../clients/models/customer.model';

@Component({
  selector: 'app-customer-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
  @if(open) {

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

    <div
        class="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        <!-- Header -->

        <div
            class="flex items-center justify-between border-b p-6">

            <h2 class="text-xl font-semibold">
                Editar cliente
            </h2>

            <button
                (click)="onClose()"
                class="rounded-lg p-2 hover:bg-slate-100">

                ✕
            </button>

        </div>

        <!-- Form -->

        <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()">

            <div class="grid grid-cols-2 gap-4 p-6">

                <div>
                    <label class="mb-1 block text-sm">
                        Nombre
                    </label>

                    <input
                        formControlName="first_name"
                        class="w-full rounded-lg border px-3 py-2">
                </div>

                <div>
                    <label class="mb-1 block text-sm">
                        Apellido
                    </label>

                    <input
                        formControlName="last_name"
                        class="w-full rounded-lg border px-3 py-2">
                </div>

                <div>
                    <label class="mb-1 block text-sm">
                        Teléfono
                    </label>

                    <input
                        formControlName="phone"
                        class="w-full rounded-lg border px-3 py-2">
                </div>

                <div>
                    <label class="mb-1 block text-sm">
                        Correo
                    </label>

                    <input
                        formControlName="email"
                        type="email"
                        class="w-full rounded-lg border px-3 py-2">
                </div>

                <div>
                    <label class="mb-1 block text-sm">
                        Sexo
                    </label>

                    <select
                        formControlName="sex"
                        class="w-full rounded-lg border px-3 py-2">

                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="N">No especifica</option>

                    </select>

                </div>

                <div>
                    <label class="mb-1 block text-sm">
                        Fecha de nacimiento
                    </label>

                    <input
                        type="date"
                        formControlName="birth"
                        class="w-full rounded-lg border px-3 py-2">
                </div>

            </div>

            <!-- Footer -->

            <div
                class="flex justify-end gap-3 border-t p-6">

                <button
                    type="button"
                    (click)="onClose()"
                    class="rounded-lg border px-4 py-2">

                    Cancelar

                </button>

                <button
                    type="submit"
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">

                    Guardar cambios

                </button>

            </div>

        </form>

    </div>

</div>

}`
})
export class CustomerEditModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input({ required: true })
  customer!: Customer | null;

  @Input()
  open = false;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  save = new EventEmitter<any>();

  form = this.fb.group({
    first_name: this.fb.control<string | null>(''),
    last_name: this.fb.control<string | null>(''),
    phone: this.fb.control<string | null>(''),
    email: this.fb.control<string | null>(''),
    sex: this.fb.control<string | null>('N'),
    birth: this.fb.control<string | null>(null)
  });

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['customer'] && this.customer) {

      this.form.patchValue({
        first_name: this.customer.firstName,
        last_name: this.customer.lastName,
        phone: this.customer.phone,
        email: this.customer.email,
        sex: this.customer.sex,
        birth: this.customer.birth ?? null
      });

    }

  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {

    if (this.form.invalid || !this.customer) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit({
      nuip: this.customer.nuip,
      data: this.form.getRawValue()
    });

  }

}