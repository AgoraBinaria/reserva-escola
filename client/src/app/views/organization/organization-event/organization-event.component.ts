import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SchemaService } from 'app/tools/components/schema.service';
import { MeService } from 'app/views/me/me.service';
import { BusService } from 'app/tools/bus.service';
import { Level } from 'app/tools/message.model';
import { IUser } from 'app/tools/user.model';
import { SecurityService } from 'app/tools/security.service';
import { StatusPipe } from 'app/tools/status.pipe';

@Component({
  selector: 'ab-organization-event',
  templateUrl: './organization-event.component.html',
  styleUrls: ['./organization-event.component.css']
})
export class OrganizationEventComponent implements OnInit {

  public url;
  public panelSchema;
  public event: any;
  public isBookingModalActive = false;
  public isRegisterModalActive = false;
  public bookingFormSchema;
  public registerFormSchema;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private schemaService: SchemaService,
    private bus: BusService,
    private security: SecurityService,
    private meService: MeService) { }

  ngOnInit() {
    this.url = this.router.url;
    this.route.params.subscribe(params => {
      this.meService.getEventById(params.eventId).subscribe((event: any) => {
        this.event = event;
        this.schemaService.getSchema$('organization_event').subscribe(schema => {
          schema.panel.header.title = event.name;
          this.panelSchema = schema.panel;
          this.panelSchema.header.subtitle = this.getDate();
          this.checkButtonStatus();
        });
        this.schemaService.getSchema$('book').subscribe(schema => {
          this.bookingFormSchema = schema.user;
          this.registerFormSchema = schema.guest;
        });
      });
    });
  }

  getDate() {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const date: Date = new Date(this.event.date);
    const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} del ${date.getFullYear()}`;

    return formattedDate;
  }

  checkButtonStatus() {
    if (this.event.freeSeats === 0 || new Date(`${this.event.date.split('T')[0]}T${this.event.startTime}`) < new Date()) {
      this.event.status = 'DISABLED';
      this.panelSchema.actions[0].disabled = true;
    }
  }

  onClick(action) {
    const user: IUser = this.security.getLocalUser();

    if (user) {
      this.isBookingModalActive = true;
    } else {
      this.isRegisterModalActive = true;
    }
  }

  onCloseModal() {
    this.isBookingModalActive = false;
    this.isRegisterModalActive = false;
  }

  onSubmitBooking(payload) {
    payload['eventId'] = this.event._id;
    this.meService.bookEvent(payload).subscribe(d => {
      this.bus.emit({ level: Level.SUCCESS, text: 'Reserva realizada con éxito', code: '' });
      this.isBookingModalActive = false;
      this.meService.getEventById(this.event._id).subscribe((event: any) => {
        this.event = event;
        this.checkButtonStatus();
      });
    });
  }

  onSubmitRegister(payload) {
    payload['eventId'] = this.event._id;
    payload['organizationId'] = this.event.organizationId;
    this.meService.bookEventGuest(payload).subscribe(d => {
      this.bus.emit({ level: Level.SUCCESS, text: 'Reserva realizada e pendente de aprobación', code: '' });
      this.isRegisterModalActive = false;
      this.meService.getEventById(this.event._id).subscribe((event: any) => {
        this.event = event;
        this.checkButtonStatus();
      });
    });
  }
}
