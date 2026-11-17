import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { CustomerListComponent } from './features/clients/pages/customer-list/customer-list.component';
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
            //   {
            //     path: 'access-control',
            //     component: AccessControlComponent
            //   }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }

];
