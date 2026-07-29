import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { AiService, ChatMessage } from '../../services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css',
})
export class AiAssistantComponent implements AfterViewChecked {
  @ViewChild('scrollArea') scrollArea!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  draft = '';
  loading = false;
  error = '';
  private shouldScroll = false;

  suggestions = [
    'Which products are running low on stock?',
    'How were sales last month compared to the month before?',
    'What should I restock next month and how much?',
    'Give me an overall analysis of my inventory.',
  ];

  constructor(private ai: AiService) {}

  ngAfterViewChecked() {
    if (this.shouldScroll && this.scrollArea) {
      this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
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

  send() {
    const text = this.draft.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', content: text });
    this.draft = '';
    this.error = '';
    this.loading = true;
    this.shouldScroll = true;

    this.ai.chat(this.messages).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.reply });
        this.loading = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        this.error = err?.error?.message || 'The assistant is unavailable right now. Please try again.';
        // Remove the unanswered user message so a retry re-sends it cleanly.
        this.draft = text;
        this.messages.pop();
        this.loading = false;
      },
    });
  }

  clearChat() {
    this.messages = [];
    this.error = '';
    this.draft = '';
  }
}
