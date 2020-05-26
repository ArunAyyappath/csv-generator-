import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { Papa } from 'ngx-papaparse';
import xlsxParser from 'xlsx-parse-json';
import { SheetSchema, FormValidation, CredentialValues, Scenario } from './parser-schemas';
import _ from 'underscore';

@Component({
  selector: 'app-parser',
  templateUrl: './parser.component.html',
  styleUrls: ['./parser.component.scss']
})

export class ParserComponent implements OnInit, OnDestroy {

  parserFormGroup: FormGroup;
  isParserSub: any;
  rows: Array<string>;
  headers: Array<string>;
  finalList = new Array();
  iteratorList = new Array();
  isChecked = true;
  hasError: boolean;
  constructor(public formBuilder: FormBuilder,
              private papa: Papa) {}
  @ViewChild('stepper', { static: true }) stepper: MatStepper;

  ngOnInit(): void {
    this.parserFormGroup = this.formBuilder.group({
      inputFile: ['', Validators.required],
      staticKey: ['', Validators.required]
    });
    this.isParserSub = this.parserFormGroup.statusChanges.subscribe(
      (status: FormValidation): void => {
        if (status === FormValidation.ISVALID) {
          this.stepper.next();
        }
      }
    );
  }

  /* Easy pick for form control */
  get formControls() { return this.parserFormGroup.controls; }

  /* phase 2 */
  // isValidated = (validate, value) => {
  //   switch (validate) {
  //     case 'head': {
  //       /* Will match the heading ending with inc-col */
  //       return value.match(/(inc-col)$/);
  //     }
  //     case 'data': {
  //       /* Will match string which ends with a number */
  //       return  value.match(/(\d+)$/);
  //     }
  //     default: {
  //       return 'No regex found';
  //     }
  //   }
  // }

  ngOnDestroy(): void {
    if (this.isParserSub) {
      this.isParserSub.unsubscribe();
    }
  }

  slideToggler = ({ checked }): void => (this.isChecked = checked);

  onFileChange = (file: File[]): void => {
    this.hasError = false;
    const [ File ] = file;
    /* https://www.npmjs.com/package/xlsx-parse-json */
    xlsxParser.onFileSelection(File, { showNullProperties : false, hideEmptyRows : true })
      .then((sheets: SheetSchema) => {
        this.rows = this.getKeyHelper(sheets);
        const [[ firstRow ]] = this.rows;
        _.map(this.rows, (row) => {
          for (const iterator of row) {
            this.iteratorList = [];
            if (this.isChecked) {
              /* Generate Zoom data */
             const credentialValues: CredentialValues =  _.pick(iterator, 'mailId', 'url');
             const { mailId, url } = credentialValues;
             const staticKey = this.formControls.staticKey.value;
             if (mailId && url && staticKey) {
              const usernameB64: string = window.btoa(mailId);
              /* Matches number which is atleast having length 7 */
              const [, zoomId] = new URL(url).pathname.match(/\/(\d{7,}).?|\/$/);
              const [, zoomPassword] = url.split('?pwd=');
              const convertedFormat = `${staticKey}~${mailId}~${zoomId}~${zoomPassword}~${usernameB64}`;
              this.iteratorList.push(convertedFormat);
             } else {
               this.hasError = true;
               return false;
             }
            } else {
              this.headers =  _.keys(firstRow);
              for (const header of this.headers) {
                if (_.has(iterator, header)) {
                  const value = _.property(header)(iterator);
                  this.iteratorList.push(value);
                } else {
                  this.iteratorList.push(header);
                }
              }
            }
            this.finalList.push(this.iteratorList);
          }
        });
        if (!this.hasError) {
          this.importAsCsvFile(this.headers, this.finalList);
        }
      });
  }

  generateSampleCsv = (scenario: Scenario): void => {
    if (scenario === Scenario.ZOOM) {
      const headers = ['mailId', 'url'];
      const data = [
        ['something@somewhere.com', 'https://domain-name/identifier/id?pwd=unique_password']
      ];
      this.importAsCsvFile(headers, data);
    }
  }

  /* Need this helper function because if the key returned is not static. */
  getKeyHelper = (sheets: SheetSchema): Array<any> => (
    _.map(_.keys(sheets), (key) => {
      return sheets[key];
    })
  )

  importAsCsvFile = (headers, dataList): void => {
    let zoomHeader: string[];
    if (!headers) {
      zoomHeader = ['converted data'];
    }
    const csv: string = this.papa.unparse(
      {
      fields: headers ? headers : zoomHeader,
      data: dataList,
      }
    );
    const blob: Blob = new Blob([csv]);
    const a: HTMLAnchorElement = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  }
}
