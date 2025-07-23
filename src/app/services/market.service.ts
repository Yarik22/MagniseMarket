import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MarketService implements OnDestroy {
  private socket$: WebSocketSubject<any> | null = null;
  private messagesSubject$ = new Subject<any>();
  messages$ = this.messagesSubject$.asObservable();

  private subscribedInstruments: Set<string> = new Set();

  connect(): void {
    if (this.socket$) return;

    const token = environment.access_token;
    const wsUrl = `${environment.URI_WSS}/api/streaming/ws/v1/realtime?token=${token}`;

    this.socket$ = webSocket(wsUrl);

    this.socket$.subscribe({
      next: (msg) => this.messagesSubject$.next(msg),
      error: (err) => console.error('[WebSocket Error]', err),
      complete: () => console.warn('[WebSocket Closed]'),
    });
  }

  subscribeToInstruments(instrumentIds: string[]): void {
    if (!this.socket$) {
      console.warn('WebSocket not connected.');
      return;
    }

    const newInstrumentSet = new Set(instrumentIds);
    this.subscribedInstruments.forEach((instrumentId) => {
      if (!newInstrumentSet.has(instrumentId)) {
        this.unsubscribeFromInstrument(instrumentId);
      }
    });

    instrumentIds.forEach((instrumentId) => {
      if (!this.subscribedInstruments.has(instrumentId)) {
        this.subscribeToInstrument(instrumentId);
      }
    });
  }

  private subscribeToInstrument(instrumentId: string): void {
    if (!this.socket$) return;

    this.socket$.next({
      type: 'l1-subscription',
      id: '1',
      instrumentId,
      provider: 'oanda',
      subscribe: true,
      kinds: ['ask', 'bid', 'last'],
    });

    this.subscribedInstruments.add(instrumentId);
  }

  private unsubscribeFromInstrument(instrumentId: string): void {
    if (!this.socket$) return;

    this.socket$.next({
      type: 'l1-subscription',
      id: '1',
      instrumentId,
      provider: 'oanda',
      subscribe: false,
      kinds: ['ask', 'bid', 'last'],
    });
    this.subscribedInstruments.delete(instrumentId);
  }

  disconnect(): void {
    this.subscribedInstruments.forEach((instrumentId) => {
      this.unsubscribeFromInstrument(instrumentId);
    });
    this.subscribedInstruments.clear();

    this.socket$?.complete();
    this.socket$ = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
