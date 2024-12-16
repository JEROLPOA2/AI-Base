import {
  APP_INITIALIZER,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';

import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularSplitModule } from 'angular-split';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../enviroment';

const firebaseConfig = {
  apiKey: environment.apiKey,
  authDomain: environment.authDomain,
  projectId: environment.projectId,
  storageBucket: environment.storageBucket,
  messagingSenderId: environment.messagingSenderId,
  appId: environment.appId,
  measurementId: environment.measurementId,
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularSplitModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularSplitModule,
    ReactiveFormsModule,
    MatDialogModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    MessageService,
    ConfirmationService, // Solo mantienes el ConfirmationService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
