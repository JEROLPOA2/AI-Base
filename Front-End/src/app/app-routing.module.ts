import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataModelComponent } from './pages/datamodel-page/datamodel.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { AuthGuard } from './Guards/Auth/auth.guard';

const routes: Routes = [
  {
    path: '', // La ruta base
    component: WelcomePageComponent, // Cambiado a WelcomePageComponent
  },
  {
    path: 'datamodel', // Ruta adicional para el DataModelComponent
    component: DataModelComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
