import {
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { PlanService } from '../services/plan.service';
import { Plan } from '../models/plan.model';
import { PlanEditModalComponent } from '../components/plan-edit-modal.component';
import { PlanCreateModalComponent } from '../components/plan-create-modal.component';

@Component({
    selector: 'app-plan-list',
    standalone: true,
    imports: [CommonModule, PlanEditModalComponent, PlanCreateModalComponent],
    templateUrl: './plan-list.component.html'
})
export class PlanListComponent implements OnInit {

    private readonly planService =
        inject(PlanService);

    plans =
        signal<Plan[]>([]);

    selectedPlan =
        signal<Plan | null>(null);

    modalOpen =
        signal(false);

    createModalOpen =
        signal(false);


    loading =
        signal(true);

    totalPlans = computed(() =>
        this.plans().length
    );

    cheapestPlan = computed(() => {

        const plans = this.plans();

        if (!plans.length) {
            return 0;
        }

        return Math.min(
            ...plans.map(plan => plan.amount)
        );

    });

    mostExpensivePlan = computed(() => {

        const plans = this.plans();

        if (!plans.length) {
            return 0;
        }

        return Math.max(
            ...plans.map(plan => plan.amount)
        );

    });

    ngOnInit(): void {

        this.get_plans()
    }


    get_plans(): void {
        this.planService
            .getAll()
            .subscribe({

                next: plans => {

                    this.plans.set(plans);

                    this.loading.set(false);

                },

                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }

            });

    }


    editPlan(
        plan: Plan
    ): void {

        this.selectedPlan.set(plan);

        this.modalOpen.set(true);

    }

    closeModal(): void {

        this.modalOpen.set(false);

        this.selectedPlan.set(null);

    }

    openCreateModal(): void {

        this.createModalOpen.set(true);

    }

    closeCreateModal(): void {

        this.createModalOpen.set(false);

    }


    savePlan(
        event: {
            planId: number;
            data: any;
        }
    ): void {

        this.planService
            .update(
                event.planId,
                event.data
            )
            .subscribe({

                next: updated => {

                    this.plans.update(plans =>
                        plans.map(plan =>
                            plan.planId === updated.planId
                                ? {
                                    ...plan,
                                    ...updated
                                }
                                : plan
                        )
                    );

                    this.closeModal();
                    alert("plan " + updated.name + " actualizado")

                },

                error: error => {
                    console.error(error);
                }

            });

    }

    createPlan(
        data: any
    ): void {

        this.planService
            .create(data)
            .subscribe({

                next: plan => {

                    this.get_plans()

                    this.closeCreateModal();

                },

                error: error => {
                    console.error(error);
                }

            });

    }


    deletePlan(
        plan: Plan
    ): void {

        const confirmed = confirm(
            `¿Desea eliminar el plan ${plan.name}?`
        );

        if (!confirmed) {
            return;
        }

        this.planService
            .delete(plan.planId)
            .subscribe({

                next: () => {

                    this.plans.update(plans =>
                        plans.filter(
                            p => p.planId !== plan.planId
                        )
                    );

                    alert(
                        `${plan.name} eliminado`
                    );

                },

                error: error => {
                    console.error(error);
                }

            });

    }

}