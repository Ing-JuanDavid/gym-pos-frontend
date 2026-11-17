import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, LucideCalendarDays, LucideClipboardList, LucideCreditCard, LucideLayoutDashboard, LucideMonitor, LucidePackage, LucideShield, LucideShoppingCart, LucideUsers, LucideWallet, LucideZap } from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    LucideZap

  ],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  operationMenu = [
    {
      label: 'Control de acceso',
      route: '/access-control',
      icon: LucideShield,
      live: true
    },
    {
      label: 'Resumen',
      route: '/',
      icon: LucideLayoutDashboard
    },
    {
      label: 'Asistencias',
      route: '/attendance',
      icon: LucideCalendarDays
    },
    {
      label: 'Clientes',
      route: '/customers',
      icon: LucideUsers
    },
    {
      label: 'Membresías',
      route: '/memberships',
      icon: LucideCreditCard
    }
  ];

  adminMenu = [
    {
      label: 'Punto de venta',
      route: '/sales',
      icon: LucideShoppingCart
    },
    {
      label: 'Productos',
      route: '/products',
      icon: LucidePackage
    },
    {
      label: 'Planes',
      route: '/plans',
      icon: LucideClipboardList
    },
    {
      label: 'Caja',
      route: '/cash-register',
      icon: LucideWallet
    },
    {
      label: 'Dispositivos',
      route: '/devices',
      icon: LucideMonitor
    }
  ];

}