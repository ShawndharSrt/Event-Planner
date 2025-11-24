import { Component, Input, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status' | 'actions';
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-table.component.html',
    styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() pageSize: number = 10;

    currentPage = signal(1);
    sortColumn = signal<string | null>(null);
    sortDirection = signal<'asc' | 'desc'>('asc');

    // Processed data (sorted)
    processedData = computed(() => {
        let processed = [...this.data];
        const column = this.sortColumn();
        const direction = this.sortDirection();

        if (column) {
            processed.sort((a, b) => {
                const valA = a[column];
                const valB = b[column];

                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    });

    // Paged data
    pagedData = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.processedData().slice(start, end);
    });

    totalPages = computed(() => Math.ceil(this.data.length / this.pageSize));

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.currentPage.set(1);
        }
    }

    sort(columnKey: string) {
        if (this.sortColumn() === columnKey) {
            this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(columnKey);
            this.sortDirection.set('asc');
        }
    }

    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage() {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }
}
