import { Component, signal } from '@angular/core';
import { CurrencyComponent } from './components/currency/currency.component';
import { ChartComponent } from './components/chart/chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyComponent, ChartComponent],
  templateUrl: './app.html',
})
export class App {}
