import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AccessEvent } from '../../../core/realtime/realtime.model';
import { accessTypeLabel, reasonTitle } from './access-labels.component';

@Component({
    selector: 'app-access-history-modal',
    standalone: true,
    imports: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './access-history-modal.component.html',
    host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class AccessHistoryModalComponent {
    readonly events = input.required<AccessEvent[]>();
    readonly closed = output<void>();

    protected readonly typeLabel = accessTypeLabel;
    protected readonly reasonTitle = reasonTitle;
}