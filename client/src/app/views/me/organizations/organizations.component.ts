import { Component, OnInit } from '@angular/core';
import { IOrganizationAdmin } from 'app/views/me/organization-admin.model';
import { Observable } from 'rxjs';
import { BusService } from 'app/tools/bus.service';
import { Level } from 'app/tools/message.model';
import { IFormSchema, IWidgetSchema, IReportSchema, ILoadEmptyStateSchema, IKeyValue } from 'app/tools/schema.model';
import { MeService } from 'app/views/me/me.service';
import { SchemaService } from 'app/tools/components/schema.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ab-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent implements OnInit {
  public organizations: any[];
  public activeSetAdminModal = false;
  public activeCreateOrganizationModal = false;
  public activeDeleteOrganizationModal = false;
  public activeOrganization;
  public createFormSchema: IFormSchema;
  public actionSchema: IWidgetSchema;
  public reportSchema: IReportSchema;
  public setAdminFormSchema: IFormSchema;
  public cardSchema: IWidgetSchema;
  public panelSchema: IWidgetSchema = {};

  public name = 'organizations';
  constructor(
    private me: MeService,
    private bus: BusService,
    private schema: SchemaService) { }

  ngOnInit() {
    this.schema
      .getSchema$('me_organizations')
      .subscribe(schemas => {
        this.actionSchema = schemas.actions;
        this.createFormSchema = schemas.create;
        this.reportSchema = schemas.report;
        this.setAdminFormSchema = schemas.setAdmin;
        this.cardSchema = { header: { title: '' }, fields: this.createFormSchema.controls };
        this.getOrganizations();
      }
      );
  }

  getOrganizations() {
    this.me
      .getOrganizations()
      .pipe(
        tap(data => this.organizations = data)
      ).subscribe(this.getOrganizationsAdmins.bind(this));
  }

  getOrganizationsAdmins() {
    this.organizations.forEach(this.getOrganizationAdmin.bind(this));
  }

  getOrganizationAdmin(organization) {
    this.me
      .getOrganizationAdmin(organization._id)
      .subscribe(users => organization.admin = users ? users[0] : null);
  }

  onSetAdmin(organization) {
    this.activeOrganization = organization;
    this.activeSetAdminModal = true;
  }

  onCloseSetAdminModal(newAdmin) {
    if (newAdmin) {
      this.setOrganizationAdmin(newAdmin);
    }
    this.activeOrganization = null;
    this.activeSetAdminModal = false;
  }

  onRowAction(data: IKeyValue) {
    if (data.key === 'setAdmin') {
      this.onSetAdmin(data.value);
    }
  }

  setOrganizationAdmin(newAdmin) {
    newAdmin.organizationId = this.activeOrganization._id;
    this.me
      .setOrganizationAdmin(newAdmin)
      .subscribe(res => {
        this.bus.emit({ level: Level.SUCCESS, text: newAdmin.name + ' asignado!!', code: '' });
        this.getOrganizations();
      });
  }

  onCreate(newOrganization) {
    this.activeCreateOrganizationModal = false;
    if (newOrganization) {
      this.me
        .postOrganization(newOrganization)
        .subscribe(res => {
          this.bus.emit({ level: Level.SUCCESS, text: newOrganization.name + ' creado!!', code: '' });
          this.getOrganizations();
        });
    }
  }


  onDelete(oldOrganization) {
    this.activeDeleteOrganizationModal = false;
    this.me
      .deleteOrganization(oldOrganization)
      .subscribe(res => {
        this.bus.emit({ level: Level.SUCCESS, text: oldOrganization.name + ' borrado!!', code: '' });
        this.getOrganizations();
      });
  }
}

