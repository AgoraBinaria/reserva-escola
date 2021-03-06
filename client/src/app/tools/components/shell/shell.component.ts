import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { BusService } from 'app/tools/bus.service';
import { SchemaService } from 'app/tools/components/schema.service';
import { IMessage } from 'app/tools/message.model';
import { MessagesService } from 'app/tools/messages.service';
import { IAction } from 'app/tools/schema.model';
import { IUser } from 'app/tools/user.model';
import { environment } from 'environments/environment';
import { filter, map, mergeMap } from 'rxjs/operators';

const TIMEOUT = 10;

@Component({
  selector: 'ab-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  public user: IUser = null;
  public organization: any = null;
  public show: boolean;
  public title: string;
  public message;
  public menuLinks: IAction[];
  public showResponsive = false;
  public numMessages: number;
  private menuSchema;
  public isPrintingMode: any;

  constructor(
    private bus: BusService,
    private schema: SchemaService,
    private router: Router,
    private messages: MessagesService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.loadMenu();
    this.onMessages();
    this.onPageRouteChange();
    this.onUserChange();
    this.onOrganizationChange();
    this.listenRouterChanges();
    this.listenOnPrintingMode();
  }

  onPageRouteChange() {
    this.getTitle();
  }

  listenOnPrintingMode() {
    this.bus.getIsPrintingMode$().subscribe(
      (value: boolean) => {
        setTimeout(() => {
          this.isPrintingMode = value;
        }, TIMEOUT)
      }
    )
  }

  getTitle() {
    this.title = environment.appTitle;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(pageRoute => pageRoute.outlet === 'primary'),
      mergeMap(primaryRoute => primaryRoute.data)
    ).subscribe(data => {
      if (data.title) {
        this.title = data.title;
      }
    });
  }

  loadMenu() {
    this.schema
      .getSchema$('menu')
      .subscribe(schema => {
        this.menuSchema = schema;
        this.menuByUserRole();
      });
  }

  onMessages() {
    this.numMessages = 0;
    const messages = JSON.parse(localStorage.getItem('messages'));
    if (messages) {
      this.numMessages = messages.length;
    }
    this.bus
      .getMessage$()
      .subscribe((message: IMessage) => {
        message.text = this.messages.getUserText(message);
        this.messages.saveMessage(message);
        this.message = message;
        this.numMessages++;
        this.show = true;
      });
  }

  onUserChange() {
    this.bus
      .getUser$()
      .subscribe((user: IUser) => {
        this.user = user;
        this.menuByUserRole();
      });
  }

  onOrganizationChange() {
    this.bus
      .getOrganization$()
      .subscribe((organization: any) => {
        this.organization = organization;
      });
  }

  menuByUserRole() {
    this.menuLinks = [];
    if (this.menuSchema) {
      this.menuLinks = this.menuLinks.concat(this.menuSchema.common);
      if (this.user && this.user.roles) {
        /*
        const userRole = this.user.roles[0];
        if (userRole) {
          const menuRole = this.menuSchema[userRole.toLowerCase()];
          if (menuRole) {
            this.menuLinks = this.menuLinks.concat(menuRole);
          }
        }
        */
        this.user.roles.forEach(userRole => {
          // const menuRole = this.menuSchema[userRole.toLowerCase()];
          // if (menuRole) {
          //     this.menuLinks = this.menuLinks.concat(menuRole);
          // }
          this.pushMenuLinksByRole(userRole);
        });
      }
    }
  }

  pushMenuLinksByRole(role) {
    const menuRole: IAction[] = this.menuSchema[role.toLowerCase()];
    if (menuRole) {
      menuRole.forEach(newElem => {
        if (this.menuLinks.findIndex(oldElem => oldElem.link === newElem.link) === -1) {
          this.menuLinks.push(newElem);
        }
      });
    }
  }

  listenRouterChanges() {
    this.router.events.subscribe((event: Event) => {
      if (this.showResponsive) {
        this.showResponsive = !this.showResponsive;
      }
    });
  }

}
