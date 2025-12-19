import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, computed, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableConfig {
    showPagination?: boolean;
    showActions?: boolean;
    pageSizeOptions?: number[];
}

export interface TableAction {
    name: string;
    label?: string;
    icon?: string;
    class?: string;
    title?: string;
}

export interface TableColumn {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status' | 'currency' | 'actions' | 'template';
    template?: TemplateRef<any>;
    format?: (value: any) => string;
    sortable?: boolean;
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
    @Input() config: TableConfig = { showPagination: true };
    @Input() actions: TableAction[] = [];
    @Input() selectable: boolean = false;

    @Output() action = new EventEmitter<{ action: string, row: any }>();
    @Output() selectionChange = new EventEmitter<any[]>();

    selectedRows = signal<Set<any>>(new Set());
    isAllSelected = computed(() => {
        const allData = this.processedData();
        return allData.length > 0 && allData.every(row => this.selectedRows().has(row));
    });

    currentPage = signal(1);
    sortColumn = signal<string | null>(null);
    sortDirection = signal<'asc' | 'desc'>('asc');

    // Internal signal for data to trigger computed updates
    private dataSignal = signal<any[]>([]);

    // Processed data (sorted)
    processedData = computed(() => {
        let processed = [...this.dataSignal()];
        const columnKey = this.sortColumn();
        const direction = this.sortDirection();

        if (columnKey) {
            processed.sort((a, b) => {
                const valA = a[columnKey];
                const valB = b[columnKey];

                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    });

    // Paged data
    pagedData = computed(() => {
        if (!this.config.showPagination) {
            return this.processedData();
        }
        const start = (this.currentPage() - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.processedData().slice(start, end);
    });

    totalPages = computed(() => Math.ceil(this.dataSignal().length / this.pageSize));

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.dataSignal.set(this.data || []);
            this.currentPage.set(1);
        }
    }

    sort(column: TableColumn) {
        if (column.sortable === false || column.type === 'actions') return;

        if (this.sortColumn() === column.key) {
            this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column.key);
            this.sortDirection.set('asc');
        }
    }

    onActionClick(actionName: string, row: any) {
        this.action.emit({ action: actionName, row });
    }

    toggleSelection(row: any) {
        if (!this.selectable) return;

        const current = new Set(this.selectedRows());
        if (current.has(row)) {
            current.delete(row);
        } else {
            current.add(row);
        }
        this.selectedRows.set(current);
        this.emitSelection();
    }

    toggleSelectAll() {
        if (!this.selectable) return;

        const current = new Set(this.selectedRows());
        const allData = this.processedData();

        if (this.isAllSelected()) {
            allData.forEach(row => current.delete(row));
        } else {
            allData.forEach(row => current.add(row));
        }

        this.selectedRows.set(current);
        this.emitSelection();
    }

    private emitSelection() {
        this.selectionChange.emit(Array.from(this.selectedRows()));
    }


    // Pagination Helpers
    getPageStart(): number {
        return (this.currentPage() - 1) * this.pageSize + 1;
    }

    getPageEnd(): number {
        const end = this.currentPage() * this.pageSize;
        return end > this.data.length ? this.data.length : end;
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
