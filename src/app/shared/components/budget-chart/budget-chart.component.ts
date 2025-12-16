import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-budget-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './budget-chart.component.html',
    styleUrls: ['./budget-chart.component.scss']
})
export class BudgetChartComponent {
    @Input() title: string = '';
    @Input() type: ChartType = 'bar';
    @Input() data: ChartData<ChartType> = { datasets: [] };
    @Input() options: ChartConfiguration['options'] = {};
    @Input() height: string = '300px';
    @Input() centerLabel: string = '';
    @Input() centerValue: string = '';
    @Input() showCustomLegend: boolean = false;

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    toggleDataset(index: number) {
        if (this.chart?.chart) {
            this.chart.chart.toggleDataVisibility(index);
            this.chart.chart.update();
        }
    }

    isDatasetHidden(index: number): boolean {
        if (this.chart?.chart) {
            return !this.chart.chart.getDataVisibility(index);
        }
        return false;
    }

    getBackgroundColor(index: number): string {
        const bgColors = this.data.datasets[0]?.backgroundColor;
        if (Array.isArray(bgColors)) {
            return (bgColors[index] as string) || '#ccc';
        }
        return typeof bgColors === 'string' ? bgColors : '#ccc';
    }

    getDataValue(index: number): string {
        const dataVal = this.data.datasets[0]?.data[index];
        if (typeof dataVal === 'number') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dataVal);
        }
        return '';
    }
}
