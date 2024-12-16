import {
  Inject,
  inject,
  Injectable,
  Injector,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { BehaviorSubject, filter, map, Observable, startWith, Subject, tap } from 'rxjs';
import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { DatabaseService } from '../Database/database.service';
import { AuthService } from '../AuthService/auth.service';

export interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  generating?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private databaseService!: DatabaseService;
  private authService!: AuthService;
  // ---------------------------------
  // Initialize thread_id
  database_thread: string;
  graph_thread: string;
  intention_thread: string;
  email: string | null = '';
  intention: string;

  private _refresh$ = new Subject<void>();

  private messagesSource = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSource.asObservable();

  private selectedThreadSubject = new BehaviorSubject<string>("");
  selectedThread$ = this.selectedThreadSubject.asObservable();

  generatingInProgress = new BehaviorSubject<boolean>(false);
  generatingInProgress$ = this.generatingInProgress.asObservable();


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private injector: Injector
  ) {
    this.graph_thread = '';
    this.database_thread = '';
    this.intention_thread = '';
    this.intention = '';

    const authService = this.getAuthService();
    authService.getUserEmail().subscribe((email) => {
      this.email = email;
    });
  }


  get refresh$(){
    return this._refresh$;
  }

  // for posterior implementation
  getGeneratingInProgress(): boolean {
    return this.generatingInProgress.getValue();
  }

  // for posterior implementation
  setGeneratingInProgress(inProgress:boolean): void {
    this.generatingInProgress.next(inProgress);
  }


  getMessageSource(): Message[] {
    return this.messagesSource.getValue();
  }


  addMessageToMessageSource(message: Message): void {
    const currentMessages = this.getMessageSource();
    this.messagesSource.next([...currentMessages, message]);
  }


  updateMessages(messages: Message[]): void {
    this.messagesSource.next(messages);
    console.log(this.messagesSource)
  }


  setSelectedThread(threadId: string): void {
    this.selectedThreadSubject.next(threadId);
  }


  getSelectedThread(): string | null {
    return this.selectedThreadSubject.getValue();
  }


  private getAuthService(): AuthService {
    
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    
    return this.authService;
  }


  private readonly http = inject(HttpClient);

  sendMessage(prompt: string): void {
    
    // --------------------------------------
    const promptObject = {
      quest_resp_chat_text: prompt,
      database_thread: this.database_thread,
      graph_thread: this.graph_thread,
      intention_thread: this.getSelectedThread(),
      email: this.email,
    };
    
    prompt = JSON.stringify(promptObject);
    // --------------------------------------

    this.setGeneratingInProgress(true);

    const userMessage: Message = {
      id: window.crypto.randomUUID(),
      text: prompt,
      fromUser: true,
    };
    
    this.addMessageToMessageSource(userMessage);

    this.getChatResponseStream(prompt).subscribe({
      next: (message) => {

        if (!message.fromUser && message.text) {
          
          try {
            
            const textObject = JSON.parse(message.text);
            console.log(textObject);

            this.database_thread =
              textObject['database_thread'] || this.database_thread;
            
            this.graph_thread = textObject['graph_thread'] || this.graph_thread;
            
            this.intention_thread =
              textObject['intention_thread'] || this.intention_thread;
          } 
          
          catch (error) {
            console.error('Failed to parse JSON:', error, message.text);
          }
        }
        // ----------------------------------------------------------------------------------
        
        this.setGeneratingInProgress(false)
        this.addMessageToMessageSource(message);
      },

      complete: () => {
        const messagesToRead = this.getMessageSource();
        console.log(messagesToRead, '\n\n');
      },

      error: () => this.setGeneratingInProgress(false),
    });
  }


  private getChatResponseStream(prompt: string): Observable<Message> {
    
    const id = window.crypto.randomUUID();
    console.log('AppLog: Sending Message');
    
    return this.http
      .post('http://localhost:4321/api/chat', prompt, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        
        filter(
          (event: HttpEvent<string>): boolean =>
            event.type === HttpEventType.Response
        ),
        
        map(
          (event: HttpEvent<string>): Message => ({
            id,
            text: (event as HttpResponse<string>).body!,
            fromUser: false,
            generating: false,
          })
        ),
        
        tap(() => {this.refresh$.next()})
      );
  }


  public getUserChats(email: string | null): Observable<any> {
    return this.http.get<any>(
      `http://localhost:4321/api/get-user-chats/${email}`
    );
  }

  
  getChatMessages(email: string | null, threadId: string): Observable<any> {
    
    if (!email || !threadId) {
      throw new Error('Email and threadId are required');
    }

    return this.http
      .get<any>(
        `http://localhost:4321/api/get-chat-messages/${email}/${threadId}`
      )
      .pipe(
        
        map((response) => {
          
          const messages: Message[] = response.map((item: any) => {
            const messageData = item.message;

            return {
              id: messageData.intention_thread,
              text: JSON.stringify({
                intention_thread: messageData.intention_thread || '',
                database_thread: messageData.database_thread || '',
                graph_thread: messageData.graph_thread || '',
                quest_resp_chat_text: messageData.quest_resp_chat_text || messageData.prompt || '',
                data: messageData.data || [],
                graph_data: messageData.graph_data || '',
                intention: messageData.intention || '',
              }),
              fromUser: item.from_user,
              generating: false,
            };
          });

          this.updateMessages(messages)
          return messages;
        })
      );
  }

}
