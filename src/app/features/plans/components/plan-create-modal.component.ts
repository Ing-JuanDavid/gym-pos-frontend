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
    selector: 'app-plan-create-modal',
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

    <div
      class="flex items-center justify-between border-b p-6"
    >

      <h2
        class="text-xl font-semibold"
      >
        Crear plan
      </h2>

      <button
        (click)="onClose()"
        class="rounded-lg p-2 hover:bg-slate-100"
      >
        ✕
      </button>

    </div>

    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
    >

      <div
        class="grid gap-4 p-6"
      >

        <input
          formControlName="name"
          placeholder="Nombre"
          class="rounded-lg border px-3 py-2"
        />

        <textarea
          formControlName="description"
          placeholder="Descripción"
          class="rounded-lg border px-3 py-2"
        ></textarea>

        <input
          type="number"
          formControlName="duration"
          placeholder="Duración en días"
          class="rounded-lg border px-3 py-2"
        />

        <input
          type="number"
          formControlName="amount"
          placeholder="Precio"
          class="rounded-lg border px-3 py-2"
        />

      </div>

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
          Crear plan
        </button>

      </div>

    </form>

  </div>

</div>

}`
})
export class PlanCreateModalComponent {

    private readonly fb =
        inject(FormBuilder);

    @Input()
    open = false;

    @Output()
    close =
        new EventEmitter<void>();

    @Output()
    save =
        new EventEmitter<any>();

    form = this.fb.nonNullable.group({
        name: [
            '',
            Validators.required
        ],

        description: [
            '',
            Validators.required
        ],

        duration: [
            30,
            Validators.required
        ],

        amount: [
            0,
            Validators.required
        ]
    });

    onClose(): void {

        this.form.reset({
            name: '',
            description: '',
            duration: 30,
            amount: 0
        });

        this.close.emit();
    }

    onSubmit(): void {

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            return;
        }

        this.save.emit(
            this.form.getRawValue()
        );
    }
}