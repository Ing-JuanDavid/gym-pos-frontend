import {
    ChangeDetectionStrategy, Component, computed, inject, input, output, signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { RealtimeService } from '../../../../core/realtime/realtime.service';
import { Customer } from '../../models/customer.model';
import { captureErrorMessage, CustomerPhotoService } from '../../services/customer-photo.service';

type CaptureState = 'ready' | 'capturing' | 'preview' | 'error';

@Component({
    selector: 'app-capture-photo-modal',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './capture-photo-modal.component.html',
    host: { '(document:keydown.escape)': 'close()' },
})
export class CapturePhotoModalComponent {

    readonly customer = input.required<Customer>();
    readonly closed = output<void>();
    /** Se emite con la URL completa cada vez que una captura queda guardada. */
    readonly captured = output<string>();

    private readonly photos = inject(CustomerPhotoService);
    private readonly realtime = inject(RealtimeService);

    protected readonly state = signal<CaptureState>('ready');
    protected readonly photoUrl = signal<string | null>(null);
    protected readonly imageFailed = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly camera = this.realtime.camera;
    protected readonly cameraOnline = computed(() => this.camera()?.state === 'online');

    protected readonly name = computed(() =>
        `${this.customer().firstName} ${this.customer().lastName}`.trim());

    protected capture(): void {
        const camera = this.camera();
        if (!camera || this.state() === 'capturing') return;

        this.state.set('capturing');
        this.error.set(null);
        this.imageFailed.set(false);

        this.photos.capture(Number(this.customer().nuip), camera.deviceId).subscribe({
            next: photo => {
                this.photoUrl.set(photo.url);
                this.state.set('preview');
                this.captured.emit(photo.url);
            },
            error: (e: HttpErrorResponse) => {
                this.error.set(captureErrorMessage(e));
                this.state.set('error');
            },
        });
    }

    /** No se puede cerrar mientras la cámara trabaja: la foto igual se guardaría. */
    protected close(): void {
        if (this.state() !== 'capturing') this.closed.emit();
    }
}