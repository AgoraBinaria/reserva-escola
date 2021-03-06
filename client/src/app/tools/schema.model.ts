import { FormGroup } from '@angular/forms';

export interface IFormSchema {
  title: string;
  submitLabel: string;
  submitIcon?: string;
  buttonBlock?: boolean;
  forgotPassword?: boolean;
  controls: IFormControl[];
}

export interface IField {
  label: string;
  key: string;
  type: string;
  tableType?: string;
  pillLink?: string;
}

export interface IFormControl extends IField {
  key: string;
  type: 'email' | 'password' | 'radio' | 'select' | 'switch' | 'text' | 'textarea' | 'date';
  label: string;
  actions?: IAction[];
  placeholder?: string;
  defaultValue?: any;
  today?: any;
  validators?: IValidator[];
  isDisabled?: boolean;
}

export interface IKeyValue {
  key?: string;
  value?: string;
}

export interface IAction extends IKeyValue {
  label: string;
  key?: string;
  value?: string;
  link?: string;
  icon?: string;
  title?: string;
  disabled?: boolean;
  btnType?: string;
  dynamicLink?: string;
  staticLink?: string;
  showKey?: string;
  showValue?: string;
  disabledStatus?: string;
}

export interface IValidator {
  key: 'required' | 'requiredTrue' | 'email' | 'validDate' | 'validOptionalDate' | 'time' | 'integer';
  args?: any[];
  errorMessage?: string;
}

export interface IForm {
  group: FormGroup;
  schema: IFormSchema
}

export interface IReportSchema {
  header: IHeader;
  deleteMessage?: string;
  emptyMessage?: string;
  fields: IField[];
  actions: IAction[];
}

export interface IHeader {
  title: string;
  subtitle?: string;
  icon?: string;
  counter?: number;
}

export interface IWidgetSchema {
  header?: IHeader;
  type?: 'panel' | 'card' | 'tile';
  image?: string,
  counter?: number;
  fields?: IField[];
  actions?: IAction[];
  columns?: boolean;
}

export interface ILoadEmptyStateSchema {
  loading: boolean;
  empty: boolean;
  action?: IAction;
}

export interface IEvent {
  label: string;
  date?: Date;
  icon?: string;
  action?: IAction;
  items: IWidgetSchema[];
}

export interface ITimelineSchema {
  header: IWidgetSchema,
  events: any[];
}
