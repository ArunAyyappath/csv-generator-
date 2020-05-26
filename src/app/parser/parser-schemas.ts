import { Url } from 'url';

export interface SheetSchema {
  [key: number]: Array<string>;
}

export enum FormValidation {
  ISVALID = 'VALID'
}

export enum Scenario {
  ZOOM = 'ZOOM',
  EXCEL = 'EXCEL',
}

export interface CredentialValues {
  mailId: string;
  password: string;
  url: string;
}
