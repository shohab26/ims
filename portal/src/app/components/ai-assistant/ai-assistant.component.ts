import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { AiService, ChatMessage } from '../../services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css',
})
export class AiAssistantComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('scrollArea') scrollArea!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  draft = '';
  loading = false;
  status = '';          // e.g. "Checking inventory…"
  streaming = '';       // answer text as it arrives
  error = '';
  private shouldScroll = false;
  private abort?: AbortController;

  suggestions = [
    'Which products are running low on stock?',
    'How were sales last month compared to the month before?',
    'What should I restock next month and how much?',
    'Give me an overall analysis of my inventory.',
  ];

  constructor(private ai: AiService, private zone: NgZone) {}

  ngAfterViewChecked() {
    if (this.shouldScroll && this.scrollArea) {
      this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.abort?.abort();
  }

  useSuggestion(text: string) {
    this.draft = text;
    this.send();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  async send() {
    const text = this.draft.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', content: text });
    this.draft = '';
    this.error = '';
    this.streaming = '';
    this.status = 'Thinking…';
    this.loading = true;
    this.shouldScroll = true;

    this.abort = new AbortController();

    try {
      await this.ai.chatStream(
        this.messages,
        (e) => {
          // fetch() callbacks run outside Angular's zone — re-enter so the view updates
          this.zone.run(() => {
            if (e.type === 'status') {
              this.status = e.text;
            } else if (e.type === 'delta') {
              this.status = '';
              this.streaming += e.text;
            } else if (e.type === 'error') {
              this.error = e.message;
            }
            this.shouldScroll = true;
          });
        },
        this.abort.signal
      );
    } catch {
      this.zone.run(() => { this.error = 'Connection to the assistant was lost.'; });
    }

    this.zone.run(() => {
      if (this.streaming.trim()) {
        this.messages.push({ role: 'assistant', content: this.streaming.trim() });
      } else if (!this.error) {
        this.error = 'The assistant returned an empty response.';
      }
      if (this.error) {
        this.draft = text;
        this.messages = this.messages.filter((m, i) => !(i === this.messages.length - 1 && m.role === 'user'));
      }
      this.streaming = '';
      this.status = '';
      this.loading = false;
      this.shouldScroll = true;
    });
  }

  stop() {
    this.abort?.abort();
  }

  clearChat() {
    this.abort?.abort();
    this.messages = [];
    this.streaming = '';
    this.status = '';
    this.error = '';
    this.draft = '';
  }
}
