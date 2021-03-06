import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchemaService } from 'app/tools/components/schema.service';
import { IWidgetSchema } from 'app/tools/schema.model';
import { MeService } from 'app/views/me/me.service';
import { IOrganization, OrganizationService } from 'app/views/organization/organization.service';
// import { Options } from 'fullcalendar';
import { CalendarComponent } from 'ng-fullcalendar';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ab-organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.css']
})
export class OrganizationHomeComponent implements OnInit {

  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;
  @ViewChild('selectedEventSection') selectedEventSection: ElementRef;

  public showEdition = false;
  public loadedMetadata = false;
  public loadingPanelSchema = {
    loading: true,
    empty: false
  };
  public organizationData: IOrganization;
  public viewSchema: IWidgetSchema;
  public eventsSchema;
  public events;
  public shownEvents = [];
  public calendarOptions = {
    locale: 'es',
    editable: false,
    eventLimit: false,
    header: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    buttonText: {
      today: 'Hoxe',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    selectable: true,
    events: [],
  };
  public selectedEvents: any;

  constructor(
    private route: ActivatedRoute,
    private me: MeService,
    private organization: OrganizationService,
    private schema: SchemaService) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        const slug = params['slug'];
        this.organization
          .getOrganizationBySlug(slug)
          .subscribe(organization => {
            this.organizationData = organization;
            if (this.organizationData) {
              this.setSchemas();
              this.getEvents();
            } else {
              this.loadingPanelSchema.loading = false;
              this.loadedMetadata = true;
              this.loadingPanelSchema.empty = true;
            }
          });
      });
  }

  setSchemas() {
    this.schema.getSchema$('organization').subscribe(schema => {
      this.viewSchema = schema;
    });
    this.schema.getSchema$('events').subscribe(schema => {
      this.eventsSchema = schema.timeline;
    });
  }

  getEvents() {
    const payload = { status: 'ACTIVE', organizationId: this.organizationData._id, private: false }

    this.me.filterEvents(payload).subscribe((events: any) => {
      if (events) {
        events.forEach((event: any) => {
          if (event.freeSeats === 0 || new Date(`${event.date.split('T')[0]}T${event.startTime}`) < new Date()) {
            event.status = 'DISABLED';
          }
        });
        this.events = events;
        this.setCalendarEvents();
      }
    });
  }

  setCalendarEvents() {
    const tempEvents = [];

    this.events
      .filter(event => (!event.private))
      .map(event => {
        const shownEvents = tempEvents.filter(tempEvent => {
          return tempEvent.start.split('T')[0] === event.date.split('T')[0];
        })

        if (!shownEvents.length) {
          tempEvents.push({
            title: 'Ver eventos',
            start: `${event.date.split('T')[0]}T${event.startTime}:00.000Z`,
            ending: `${event.date.split('T')[0]}T${event.endTime}:00.000Z`,
            allDay: true
          });
        }
      });
    this.shownEvents = tempEvents;
  }

  valueByPath(target, path) {
    return this.schema.valueByPath(target, path);
  }

  onEventClick(data: any) {
    const payload = {
      organizationId: this.organizationData._id,
      startDate: `${data.event.ending.split('T')[0]}T0:00:00.000Z`,
      endingDate: `${data.event.ending.split('T')[0]}T23:59:59.999Z`,
      private: false
    }

    this.me.filterEvents(payload)
      .pipe(
        map((events: any) => {
          return events
            .filter((event: any) => event.status !== 'CANCELED')
            .map((event: any) => {
              if (new Date(event.date.split('T')[0]) < new Date()) {
                event.status = 'DISABLED';
              }
              return event;
            });
        })
      ).subscribe((events: any) => {
        this.selectedEvents = events;
        this.selectedEventSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
      });
  }

}
