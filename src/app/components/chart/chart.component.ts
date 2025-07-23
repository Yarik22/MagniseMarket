import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartService, BarData } from '../../services/chart.service';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit, OnDestroy {
  instrumentId: string = '';
  chartOptions: any = {};
  isLoading = false;

  private subscription!: Subscription;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.subscription = this.chartService.instrumentId$.subscribe((id) => {
      if (id) {
        this.instrumentId = id;
        this.loadChartData();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadChartData(): void {
    this.isLoading = true;
    this.chartService.getChartData(this.instrumentId).subscribe({
      next: (response) => {
        this.prepareChartOptions(response.data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.isLoading = false;
      },
    });
  }

  prepareChartData(bars: BarData[]): any[] {
    return bars.map((bar) => ({
      x: new Date(bar.t),
      y: [bar.o, bar.h, bar.l, bar.c],
    }));
  }

  prepareChartOptions(bars: BarData[]): void {
    this.chartOptions = {
      series: [
        {
          name: 'candle',
          data: this.prepareChartData(bars),
        },
      ],
      chart: {
        type: 'candlestick',
        height: 500,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      title: {
        text: `Chart`,
        align: 'left',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
        labels: {
          formatter: (value: number) => value.toFixed(5),
        },
      },
      tooltip: {
        enabled: true,
        x: {
          format: 'dd MMM yyyy HH:mm',
        },
      },
    };
  }
}
