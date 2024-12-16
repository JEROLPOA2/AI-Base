import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/AuthService/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class WelcomePageComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }


  onSubmit() {
    this.loginWithEmailAndPassword()
  }


  forgotPassword(event: Event) {
    event.preventDefault();
    console.log('Forgot password clicked');
    // Lógica para manejar "Olvidé mi contraseña"
  }


  loginWithEmailAndPassword(){
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.authService.loginWithEmailAndPassword(email, password).then(
      (response) => {
        this.router.navigate(['/datamodel'])
      }
    )
  }

  
  signUp(event: Event) {
    event.preventDefault();
    console.log('Sign up clicked');
    // Lógica para manejar el registro de usuario
  }
}
