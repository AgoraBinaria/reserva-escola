import { MeService } from '../me.service';
import { BusService } from '../../../tools/bus.service';
import { Component, OnInit } from '@angular/core';
import { IWidgetSchema, IReportSchema, IFormSchema } from 'app/tools/schema.model';
import { SchemaService } from 'app/tools/components/schema.service';

@Component({
  selector: 'ab-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  panelSchema: IWidgetSchema = {};
  actionSchema: IWidgetSchema;
  reportSchema: IReportSchema;
  createFormSchema: IFormSchema;
  users: any[];

  constructor(private bus: BusService, private me: MeService, private schema: SchemaService) { }

  ngOnInit() {
    this.schema
      .getSchema$('me_users')
      .subscribe(schemas => {
        this.actionSchema = schemas.actions;
        this.createFormSchema = schemas.create;
        this.reportSchema = schemas.report;
        this.getUsers();
      });
  }

  getUsers() {
    this.me
      .getUsers()
      .subscribe(users => this.users = users);
  }
  onCreate(data) {
    console.log('creating user: ', data);
    this.me.inviteUser(data).subscribe(r => this.getUsers());
  }
  onDelete(data) {
    console.log('deleting user: ', data);
    this.me.deleteUser(data).subscribe(r => this.getUsers());
  }
  onRowAction(data) {
    console.log(`action : ${data.key} over user: ${data.value}`);
    if (data.key === 'aprobe') {
      this.me.approbeUser(data.value).subscribe(r => this.getUsers());
    } else if (data.key === 'disable') {
      this.me.disableUser(data.value).subscribe(r => this.getUsers());
    }
  }
}
