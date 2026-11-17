import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import {
  LucideBell,
  LucideClock3,
  LucideMoon,
  LucideSearch
} from '@lucide/angular';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    LucideBell,
    LucideClock3,
    LucideMoon,
    LucideSearch
  ],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent implements OnInit, OnDestroy {

  currentTime = signal('');
  currentDate = signal('');

  private intervalId?: number;

  ngOnInit(): void {
    this.updateDateTime();

    this.intervalId = window.setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateDateTime(): void {

    const now = new Date();

    this.currentTime.set(
      now.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    this.currentDate.set(
      now.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
  }
}