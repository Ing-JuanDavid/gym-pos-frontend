import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { CustomerListComponent } from './features/clients/pages/customer-list/customer-list.component';
import { PlanListComponent } from './features/plans/pages/plan.component';
import { MembershipListComponent } from './features/memberships/pages/membership.component';
import { SaleListComponent } from './features/sales/pages/sale.component';
import { AccessControlPage } from './features/access-control/pages/access-control.component';
import { AttendancePageComponent } from './features/attendances/pages/attendance-page.component';
import { CustomerDetailComponent } from './features/clients/components/customer-detail-view/customer-detail.component';
import { LoginComponent } from './features/login/login-page.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: '',
        component: DashboardLayoutComponent,
        canActivate: [authGuard],
        children: [

            {
                path: '',
                redirectTo: 'access-control',
                pathMatch: 'full'
            },

            {
                path: 'customers',
                component: CustomerListComponent
            },

            {
                path: 'customers/:nuip',
                component: CustomerDetailComponent
            },

            {
                path: 'plans',
                component: PlanListComponent
            },

            {
                path: 'memberships',
                component: MembershipListComponent
            },

            {
                path: 'sales',
                component: SaleListComponent
            },

            {
                path: 'access-control',
                component: AccessControlPage
            },

            {
                path: 'attendance',
                component: AttendancePageComponent
            }

        ]
    },

    {
        path: '**',
        redirectTo: 'login'
    }

];