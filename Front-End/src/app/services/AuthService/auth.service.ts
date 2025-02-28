import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  getUserEmail(): Observable<string | null> {
    return authState(this.auth).pipe(
      map((user: User | null) => user?.email || null)
    );
  }

  async loginWithEmailAndPassword(email: string, password: string) {
    // Se autentica con email y contraseña
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const userEmail = credential.user.email;
    if (!userEmail) {
      await signOut(this.auth);
      throw new Error('El usuario no tiene un correo asociado.');
    }
    // Verifica en Firestore que el usuario esté autorizado
    const userDocRef = doc(this.firestore, `allowed_users/${userEmail}`);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || userDocSnap.data()?.['authorized'] !== true) {
      await signOut(this.auth);
      throw new Error('Cuenta no autorizada.');
    }
    return credential;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    // Se autentica con Google
    const credential = await signInWithPopup(this.auth, provider);
    const email = credential.user.email;
    if (!email) {
      await signOut(this.auth);
      throw new Error('El usuario no tiene un correo asociado.');
    }
    // Verifica en Firestore que el usuario esté autorizado
    const userDocRef = doc(this.firestore, `allowed_users/${email}`);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || userDocSnap.data()?.['authorized'] !== true) {
      await signOut(this.auth);
      throw new Error('Cuenta no autorizada.');
    }
    return credential;
  }

  logout() {
    return from(signOut(this.auth));
  }
}
