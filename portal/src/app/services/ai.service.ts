import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type StreamEvent =
  | { type: 'status'; text: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

@Injectable({ providedIn: 'root' })
export class AiService {
  baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** Non-streaming fallback. */
  chat(messages: ChatMessage[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.baseUrl}/ai/chat`, { messages });
  }

  /**
   * Streaming chat over SSE. Uses fetch() rather than HttpClient because
   * HttpClient buffers the whole response — which is exactly what we're
   * trying to avoid. The auth interceptor doesn't run here, so the token
   * is attached manually.
   */
  async chatStream(
    messages: ChatMessage[],
    onEvent: (e: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.auth.getToken() ?? ''}`,
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!res.ok || !res.body) {
      let message = 'The assistant is unavailable right now.';
      try { message = (await res.json())?.message ?? message; } catch { /* not JSON */ }
      onEvent({ type: 'error', message });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const line = frame.split('\n').find((l) => l.startsWith('data: '));
        if (!line) continue;
        try { onEvent(JSON.parse(line.slice(6))); } catch { /* ignore partial */ }
      }
    }
  }
}
