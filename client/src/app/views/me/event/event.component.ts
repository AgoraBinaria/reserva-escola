import { Component, OnInit, ViewChild } from '@angular/core';
import { SchemaService } from 'app/tools/components/schema.service';
import { MeService } from 'app/views/me/me.service';
import { SecurityService } from 'app/tools/security.service';
import { BusService } from 'app/tools/bus.service';
import { IFormSchema, IWidgetSchema } from 'app/tools/schema.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Level } from 'app/tools/message.model';

@Component({
  selector: 'ab-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  @ViewChild('filesInput') filesInput;

  public formKey: 'create' | 'edit' = 'create';
  public panelSchema: IWidgetSchema;
  public tileSchema: IWidgetSchema;
  public formSchema: IFormSchema;
  public showModal: false;
  public fileConfirmButton = {
    label: 'Subir',
    key: 'upload'
  }
  public organization: any;
  public event: any;

  constructor(private schema: SchemaService,
    private route: ActivatedRoute,
    private me: MeService,
    private security: SecurityService,
    private bus: BusService,
    private router: Router) { }

  ngOnInit() {
    this.organization = this.security.getLocalOrganization();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.formKey = 'edit';
        this.me.getEventById(params['id']).subscribe((ev: any) => {
          this.event = ev;
          this.getSchemas();
        });
      } else {
        this.getSchemas();
      }
    });
  }

  getSchemas() {
    this.schema
      .getSchema$('me_event')
      .subscribe(schemas => {
        this.panelSchema = schemas;
        this.tileSchema = schemas['tile'];
        this.formSchema = schemas[this.formKey];
        if (this.event) {
          this.panelSchema.header.title = `Editar evento - ${this.event.name}`;
          this.panelSchema.header.subtitle = 'Editar a información do evento';
          this.schema.populateDefaultValues(this.formSchema, this.event);
          this.formSchema.controls[0].defaultValue = new Date(this.event.date).toISOString().slice(0, 10);
        } else {
          this.schema.populateDefaultValues(this.formSchema, this.organization);
          this.formSchema.controls[0].defaultValue = 'dd/mm/aaaa';
          this.formSchema.controls[4].defaultValue = 'hh:mm';
          this.formSchema.controls[5].defaultValue = 'hh:mm';
        }
      });
  }

  onSend(ev) {
    const data = Object.assign({}, ev);

    this.transformDate(data);
    if (this.formKey === 'create') {
      this.me.postEvent(data).subscribe((event: any) => {
        this.bus.emit({ level: Level.SUCCESS, text: 'Oferta creada con éxito', code: '' });
        this.event = event;
        this.formKey = 'edit';
        this.ngOnInit();
      });
    }
    if (this.formKey === 'edit') {
      this.updateEvent(data);
      this.me.editEvent(this.event).subscribe(d => {
        data.ownerId = this.event.ownerId;
        this.ngOnInit();
        this.bus.emit({ level: Level.SUCCESS, text: 'Oferta editada con éxito', code: '' });
      });
    }
  }

  updateEvent(data) {
    Object.keys(data).map(key => {
      this.event[key] = data[key];
    });
  }

  uploadFiles(ev) {
    const filesData: FormData = this.getFilesToUpload();
    this.me.postEventFiles(ev._id, filesData).subscribe(d => {
      if (this.formKey === 'edit') {
        this.me.getEventById(this.event._id).subscribe(event => {
          this.event = event;
          this.showModal = false;
        });
      }
    });
  }

  onDeleteFile(file) {
    this.me.removeFile(this.event._id, file.name).subscribe(event => {
      this.event = event;
    });
  }

  getFilesToUpload() {
    let filesToUpload: Array<File> = [];
    const domFiles = this.filesInput.nativeElement.files;
    const formData: FormData = new FormData();

    filesToUpload = <Array<File>>domFiles;

    for (let i = 0; i < domFiles.length; i++) {
      formData.append('files', filesToUpload[i], filesToUpload[i]['name']);
    }

    return formData;
  }

  transformDate(event) {
    const dateArr = event.date.split('-');
    const year = dateArr[0];
    const month = dateArr[1] - 1;
    const day = dateArr[2];
    let hour = 12;
    event.date = new Date(year, month, day, hour, 0, 0, 0);
    if (event.shift === 'Diurno') {
      hour = 14;
    } else {
      hour = 21;
    }
    event['time'] = new Date(year, month, day, hour, 0, 0, 0);
  }
}
