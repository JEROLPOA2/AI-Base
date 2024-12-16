import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TableService } from '../../services/TableService/table.service';
import { AuthService } from '../../services/AuthService/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AngularSplitModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatMenuModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
  
  isMobile: boolean = false;
  activeTab: string = 'datamodel';
  email?: string | null;

  @Output() tabChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private tableService: TableService, 
    private authService: AuthService, 
    private router: Router
  ) {}


  ngOnInit(): void {
    this.getUserEmail()
  }


  setActiveTab(tab: string): void {
    
    this.tabChanged.emit(tab);
    this.activeTab = tab;

    if (this.activeTab === 'report') {
      this.tableService.setMenu('');
    }

    console.log('header', tab);
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.showIcon();
  }

  
  showIcon() {
    const screenWidth = window.innerWidth;
    this.isMobile = screenWidth <= 766 && screenWidth >= 600;
  }


  getUserEmail(){
    this.authService.getUserEmail().subscribe((email) => {
      this.email = email;
    })
  }


  logout(){
    this.authService.logout()
    this.router.navigate(['/']);
  }

}
