import {
  AfterViewChecked,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Message,
  MessageService,
} from '../../services/Message/message.service';
import { MatDialog } from '@angular/material/dialog';
import { ResultsDialogComponent } from '../results-dialog/results-dialog.component';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
})

export class AiChatComponent implements AfterViewChecked {
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  messages: Message[] = [];
  generatingInProgress = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
    
    this.messageService.generatingInProgress.subscribe((inProgress:boolean) => {
      this.generatingInProgress = inProgress;
    });
  }


  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }


  scrollToBottom(): void {
    
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }


  sendMessage(form: NgForm, messageText: string): void {
    
    if (!messageText.trim()) return;

    this.messageService.sendMessage(messageText);
    form.resetForm();
  }


  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }


  handleKeyDown(event: KeyboardEvent, form: NgForm): void {
    
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      if (form.valid) {
        this.sendMessage(form, form.value.message);
      }
    }
  }


  openDialog(data: any, intention: any): void {
    
    const dialogRef = this.dialog.open(ResultsDialogComponent, {
      maxHeight: '90vh',
      minWidth: '300px',
      maxWidth: '80vw',
      data: { results: data, intention },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }


  getQuestRespFromMessage(message: Message): string {
    
    try {
      const parsedMessage = JSON.parse(message.text);
      return parsedMessage.quest_resp_chat_text || message.text;
    } 
    
    catch {
      return message.text;
    }
  }

  
  hasData(message: Message): boolean {
    
    try {
      const parsedMessage = JSON.parse(message.text);
      return !!(parsedMessage.data?.length || parsedMessage.graph_data);
    } 
    
    catch {
      return false;
    }
  }


  getDataFromMessage(message: Message): any[] {
    
    try {
      const parsedMessage = JSON.parse(message.text);
      return parsedMessage.graph_data || parsedMessage.data || [];
    } 
    
    catch {
      return [];
    }
  }


  getIntentionFromMessage(message: Message): string {
    
    try {
      return JSON.parse(message.text).intention || '';
    } 
    
    catch {
      return '';
    }
  }
}
