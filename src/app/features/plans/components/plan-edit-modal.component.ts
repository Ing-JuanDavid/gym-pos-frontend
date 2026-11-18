import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    OnChanges,
    inject
} from '@angular/core';

import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { Plan } from '../models/plan.model';

@Component({
    selector: 'app-plan-edit-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    template: `@if(open) {

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
        Editar plan
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
        >
        </textarea>

        <input
          type="number"
          formControlName="duration"
          placeholder="Duración"
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
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Guardar cambios
        </button>

      </div>

    </form>

  </div>

</div>

}`
})
export class PlanEditModalComponent
    implements OnChanges {

    private readonly fb =
        inject(FormBuilder);

    @Input({ required: true })
    plan!: Plan | null;

    @Input()
    open = false;

    @Output()
    close =
        new EventEmitter<void>();

    @Output()
    save =
        new EventEmitter<{
            planId: number;
            data: any;
        }>();

    form = this.fb.group({
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

    ngOnChanges(
        changes: SimpleChanges
    ): void {

        if (
            changes['plan'] &&
            this.plan
        ) {

            this.form.patchValue({
                name: this.plan.name,
                description:
                    this.plan.description,
                duration:
                    this.plan.duration,
                amount:
                    this.plan.amount
            });

        }

    }

    onClose(): void {
        this.close.emit();
    }

    onSubmit(): void {

        if (
            this.form.invalid ||
            !this.plan
        ) {

            this.form.markAllAsTouched();

            return;
        }

        this.save.emit({
            planId: this.plan.planId,
            data:
                this.form.getRawValue()
        });

    }
}