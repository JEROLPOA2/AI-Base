import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth) { }

  getUserEmail(): Observable<string | null> {
    return this.auth.authState.pipe(
      map((user: any) => user?.email || null)
    );
  }

  loginWithEmailAndPassword(email: string, password: string){
    return this.auth.signInWithEmailAndPassword(email, password)
  }

  logout() {
    return this.auth.signOut()
  }
}
