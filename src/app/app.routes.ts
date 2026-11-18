import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { CustomerListComponent } from './features/clients/pages/customer-list/customer-list.component';
import { PlanListComponent } from './features/plans/pages/plan.component';
import { MembershipListComponent } from './features/memberships/pages/membership.component';
import { SaleListComponent } from './features/sales/pages/sale.component';
CustomerListComponent
export const routes: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'customers',
                component: CustomerListComponent
            },
            {
                path: 'plans',
                component: PlanListComponent
            }
            ,
            {
                path: 'memberships',
                component: MembershipListComponent
            }
            ,
            {
                path: 'sales',
                component: SaleListComponent
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }

];
