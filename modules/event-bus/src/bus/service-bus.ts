import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, from, throwError } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface BusMessage {
  topic: string;
  payload: unknown;
}

type BusHandler = (payload: unknown) => unknown;

/**
 * In-memory, app-scoped bus for cross-module queries and domain events.
 * No persistence and no replay: subscribers reload current state on init and
 * use events only as change signals.
 */
@Injectable({ providedIn: 'root' })
export class ServiceBus implements OnDestroy {
  private readonly messages = new Subject<BusMessage>();
  private readonly handlers = new Map<string, BusHandler>();

  publish<TPayload>(topic: string, payload: TPayload): void {
    this.messages.next({ topic, payload });
  }

  on<TPayload>(topic: string): Observable<TPayload> {
    return this.messages.pipe(
      filter((message) => message.topic === topic),
      map((message) => message.payload as TPayload),
    );
  }

  handle<TRequest, TResponse>(
    topic: string,
    handler: (payload: TRequest) => Observable<TResponse> | Promise<TResponse> | TResponse,
  ): void {
    if (this.handlers.has(topic)) {
      throw new Error(`Service bus handler already registered for "${topic}".`);
    }
    this.handlers.set(topic, handler as BusHandler);
  }

  request<TRequest, TResponse>(topic: string, payload: TRequest): Observable<TResponse> {
    return new Observable<TResponse>((subscriber) => {
      const handler = this.handlers.get(topic);
      if (!handler) {
        subscriber.error(new Error(`No service bus handler registered for "${topic}".`));
        return undefined;
      }

      let result: unknown;
      try {
        result = handler(payload);
      } catch (error) {
        subscriber.error(error);
        return undefined;
      }

      if (result instanceof Observable) {
        const subscription = (result as Observable<TResponse>).subscribe(subscriber);
        return () => subscription.unsubscribe();
      }

      if (result instanceof Promise) {
        const subscription = from(result as Promise<TResponse>).subscribe(subscriber);
        return () => subscription.unsubscribe();
      }

      subscriber.next(result as TResponse);
      subscriber.complete();
      return undefined;
    });
  }

  ngOnDestroy(): void {
    this.messages.complete();
    this.handlers.clear();
  }
}
