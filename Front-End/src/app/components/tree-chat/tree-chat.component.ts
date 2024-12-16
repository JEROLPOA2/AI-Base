import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { TableService } from '../../services/TableService/table.service';
import { AuthService } from '../../services/AuthService/auth.service';
import { MessageService } from '../../services/Message/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-chat',
  standalone: true,
  imports: [TreeModule],
  templateUrl: './tree-chat.component.html',
  styleUrls: ['./tree-chat.component.scss'],
})

export class TreeChatComponent implements OnInit {
  
  files: TreeNode[] = [
    {
      key: '1',
      label: 'Nuevo chat',
      icon: 'pi pi-fw pi-plus',
      styleClass: 'children-node',
    },
  ];


  selectedFile?: TreeNode;
  suscription?: Subscription;
  private isFirstLoad = true;


  constructor(
    private tableService: TableService,
    private authService: AuthService,
    private messageService: MessageService,
    
  ) {}


  ngOnInit(): void {
    
    this.selectedFile = undefined;
    this.getUserChats();
    this.suscription = this.messageService.refresh$.subscribe(() => {this.getUserChats()})
  }

  nodeSelect(event: any): void {
  
    const threadId = event.node.label;

    if (threadId === 'Nuevo chat') {
      
      console.log('Nuevo chat presionado');
      this.messageService.setSelectedThread("");
      this.messageService.updateMessages([{ id: ' ', text: ' ', fromUser: true }]);
    }

    else {
      
      console.log('Seleccionado thread:', threadId);
      this.messageService.setSelectedThread(threadId); // Actualiza el selectedThread en el servicio

      this.authService.getUserEmail().subscribe((email) => {
        
        this.messageService.getChatMessages(email, threadId).subscribe((messages) => {
          this.messageService.updateMessages(messages);
        });

      });
    }
    this.tableService.setMenu('Chat');
  }

  getUserChats(): void {
    
    this.authService.getUserEmail().subscribe((email) => {
      
      this.messageService.getUserChats(email).subscribe((response) => {
        
        const mappedThreads = response.map((thread: any, index: any) => ({
          key: (index + 2).toString(),
          label: thread.thread_id,
          icon: 'pi pi-fw pi-comments',
          styleClass: 'children-node',
        }));

        this.files = [
          {
            key: '1',
            label: 'Nuevo chat',
            icon: 'pi pi-fw pi-plus',
            styleClass: 'children-node',
          },
          ...mappedThreads,
        ];

        // Seleccionar el último chat si no es la primera carga
        if (!this.isFirstLoad && mappedThreads.length > 0) {
          const lastChat = mappedThreads[0];
          this.selectedFile = lastChat;
          this.nodeSelect({ node: lastChat }); // Simula la selección del último nodo
        }

        // Cambiar la bandera después de la primera carga
        this.isFirstLoad = false;
      });
    });

  }
  
}
