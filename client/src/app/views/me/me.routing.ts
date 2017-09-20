import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeComponent } from 'app/views/me/me/me.component';
import { UsersComponent } from 'app/views/me/users/users.component';
import { OrganizationsComponent } from 'app/views/me/organizations/organizations.component';
import { OrganizationComponent } from 'app/views/me/organization/organization.component';
import { EventsComponent } from 'app/views/me/events/events.component';

const routes: Routes = [
  {
    path: '',
    component: MeComponent,
    data: { name: 'me', title: 'O meu perfil' }
  },
  {
    path: 'events',
    component: EventsComponent,
    data: { name: 'me_events', title: 'Eventos' }
  },
  {
    path: 'organizations',
    component: OrganizationsComponent,
    data: { name: 'me_organizations', title: 'Centros' }
  },
  {
    path: 'organization',
    component: OrganizationComponent,
    data: { name: 'me_organization', title: 'O meu centro' }
  },
  {
    path: 'users',
    component: UsersComponent,
    data: { name: 'me_users', title: 'Usuarios' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeRoutingModule { }
