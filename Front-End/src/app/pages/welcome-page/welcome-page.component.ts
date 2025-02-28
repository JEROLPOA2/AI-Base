import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  imports: [CommonModule],
})
export class WelcomePageComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/datamodel']);
    } catch (error: any) {
      alert(error.message);
    }
  }
}
