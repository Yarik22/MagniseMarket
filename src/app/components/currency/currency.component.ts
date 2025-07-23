import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Instrument,
  InstrumentsService,
  Paging,
} from '../../services/instruments.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MarketService } from '../../services/market.service';
import { ChartService } from '../../services/chart.service';

interface MarketData {
  lastPrice?: number;
  bidPrice?: number;
  askPrice?: number;
  change?: number;
  changePct?: number;
  lastUpdated?: Date;
}

@Component({
  selector: 'app-currency',
  imports: [CommonModule],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  instruments: Instrument[] = [];
  paging!: Paging;
  currentPage = 1;
  pageSize = 10;
  marketData: { [instrumentId: string]: MarketData } = {};
  private wsSubscription!: Subscription;

  constructor(
    private instrumentsService: InstrumentsService,
    private mkService: MarketService,
    private chartService: ChartService
  ) {}
  selectInstrument(instrumentId: string): void {
    this.chartService.setInstrumentId(instrumentId);
  }

  ngOnInit(): void {
    this.mkService.connect();
    this.wsSubscription = this.mkService.messages$.subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
    this.loadInstruments(this.currentPage);
  }

  ngOnDestroy(): void {
    this.wsSubscription.unsubscribe();
  }

  handleWebSocketMessage(message: any): void {
    if (message.type === 'l1-snapshot' || message.type === 'l1-update') {
      const instrumentId = message.instrumentId;
      const currentData = this.marketData[instrumentId] || {};

      const quote = message.type === 'l1-snapshot' ? message.quote : message;

      if (quote.ask) {
        currentData.askPrice = quote.ask.price;
      }
      if (quote.bid) {
        currentData.bidPrice = quote.bid.price;
      }
      if (quote.last) {
        currentData.lastPrice = quote.last.price;
        if (quote.last.change !== undefined) {
          currentData.change = quote.last.change;
        }
        if (quote.last.changePct !== undefined) {
          currentData.changePct = quote.last.changePct;
        }
      }
      if (message.change !== undefined) {
        currentData.change = message.change;
      }
      if (message.changePct !== undefined) {
        currentData.changePct = message.changePct;
      }
      const timestamps = [
        quote.ask?.timestamp,
        quote.bid?.timestamp,
        quote.last?.timestamp,
      ].filter((t) => t);

      if (timestamps.length > 0) {
        currentData.lastUpdated = new Date(
          Math.max(...timestamps.map((t) => new Date(t).getTime()))
        );
      }

      this.marketData[instrumentId] = currentData;
    }
  }

  loadInstruments(page: number): void {
    this.instrumentsService
      .getInstruments('oanda', 'forex', page, this.pageSize)
      .subscribe((response) => {
        this.instruments = response.data;
        this.paging = response.paging;
        this.currentPage = page;

        const instrumentIds = this.instruments.map((i) => i.id);
        this.mkService.subscribeToInstruments(instrumentIds);
      });
  }

  nextPage(): void {
    if (this.currentPage < this.paging.pages) {
      this.loadInstruments(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadInstruments(this.currentPage - 1);
    }
  }

  getMarketData(instrumentId: string): MarketData {
    return this.marketData[instrumentId] || {};
  }

  getChangeClass(value: number | undefined): string {
    if (value === undefined) return '';
    return value >= 0 ? 'positive-change' : 'negative-change';
  }

  formatPrice(price: number | undefined): string {
    return price !== undefined ? price.toFixed(5) : '-';
  }
}
