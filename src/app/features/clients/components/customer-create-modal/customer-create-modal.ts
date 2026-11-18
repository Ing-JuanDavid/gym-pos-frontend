import {
  Component,
  EventEmitter,
  Output,
  Input,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  template: `
@if(open) {

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
>

  <div
    class="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
  >

    <!-- Header -->
    <div
      class="flex items-center justify-between border-b p-6"
    >

      <h2 class="text-xl font-semibold">
        Crear cliente
      </h2>

      <button
        (click)="onClose()"
        class="rounded-lg p-2 hover:bg-slate-100"
      >
        ✕
      </button>

    </div>

    <!-- Form -->
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
    >

      <div class="grid grid-cols-2 gap-4 p-6">

        <div>
          <label class="mb-1 block text-sm">
            Documento
          </label>

          <input
            type="number"
            formControlName="nuip"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Nombre
          </label>

          <input
            formControlName="first_name"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Apellido
          </label>

          <input
            formControlName="last_name"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Teléfono
          </label>

          <input
            formControlName="phone"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Correo
          </label>

          <input
            type="email"
            formControlName="email"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Sexo
          </label>

          <select
            formControlName="sex"
            class="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Seleccione
            </option>

            <option value="M">
              Masculino
            </option>

            <option value="F">
              Femenino
            </option>

            <option value="N">
              No especifica
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm">
            Fecha de nacimiento
          </label>

          <input
            type="date"
            formControlName="birth"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 border-t p-6"
      >

        <button
          type="button"
          (click)="onClose()"
          class="rounded-lg border px-4 py-2"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Crear cliente
        </button>

      </div>

    </form>

  </div>

</div>

}
`
})
export class ClientCreateComponent {

  private readonly fb = inject(FormBuilder);

  @Input()
  open = false;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  save = new EventEmitter<any>();

  form = this.fb.nonNullable.group({
    nuip: [
      '',
      Validators.required
    ],

    first_name: [
      '',
      Validators.required
    ],

    last_name: [
      '',
      Validators.required
    ],

    phone: [
      '',
      Validators.required
    ],

    email: [''],

    sex: [
      '',
      Validators.required
    ],

    birth: ['']
  });

  onClose(): void {

    this.form.reset();

    this.close.emit();
  }

  onSubmit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    this.save.emit({
      nuip: Number(value.nuip),

      first_name: value.first_name,
      last_name: value.last_name,

      phone: value.phone,
      email: value.email,

      sex: value.sex,

      birth: value.birth || null
    });
  }
}