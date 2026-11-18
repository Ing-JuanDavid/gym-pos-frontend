import {
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';

import { MembershipService } from '../services/membership.service';
import { MembershipDetail } from '../models/membership.model';
import { LucideIdCard } from '@lucide/angular';

@Component({
    selector: 'app-membership-list',
    standalone: true,
    templateUrl: './membership-list.component.html',
    imports: [LucideIdCard]
})
export class MembershipListComponent
    implements OnInit {

    private readonly membershipService =
        inject(MembershipService);

    memberships =
        signal<MembershipDetail[]>([]);

    selectedFilter =
        signal<boolean | undefined>(
            undefined
        );

    searchNuip =
        signal('');


    loading =
        signal(true);

    activeMemberships =
        computed(() =>
            this.memberships()
                .filter(
                    membership =>
                        membership.status
                )
                .length
        );

    ngOnInit(): void {
        this.loadMemberships();
    }

    loadMemberships(): void {

        this.loading.set(true);

        this.membershipService
            .getAll(
                this.selectedFilter()
            )
            .subscribe({

                next: memberships => {

                    this.memberships.set(
                        memberships
                    );

                    this.loading.set(false);

                },

                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }

            });

    }

    filterMemberships(
        active?: boolean
    ): void {

        this.selectedFilter.set(
            active
        );

        const nuip =
            Number(this.searchNuip());

        if (nuip) {

            this.searchMemberships();

            return;
        }

        this.loadMemberships();

    }

    searchMemberships(): void {

        const nuip =
            Number(this.searchNuip());

        if (!nuip) {

            this.loadMemberships();

            return;
        }

        this.loading.set(true);

        this.membershipService
            .getByCustomer(
                nuip,
                this.selectedFilter()
            )
            .subscribe({

                next: memberships => {

                    this.memberships.set(
                        memberships
                    );

                    this.loading.set(false);

                },

                error: error => {

                    console.error(error);

                    this.loading.set(false);

                }

            });

    }


}