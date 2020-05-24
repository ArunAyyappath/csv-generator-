import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-parser',
  templateUrl: './parser.component.html',
  styleUrls: ['./parser.component.scss']
})

export class ParserComponent implements OnInit, OnDestroy {

  parserFormGroup: FormGroup;
  isParserSub: any;
  constructor(public formBuilder: FormBuilder) {}
  @ViewChild('stepper', { static: true }) stepper: MatStepper;

  ngOnInit() {
    this.parserFormGroup = this.formBuilder.group({
      inputFile: ['', Validators.required]
    });
    this.isParserSub = this.parserFormGroup.statusChanges.subscribe(
      (status: string): any => {
        if (status === 'VALID') {
          this.stepper.next();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.isParserSub) {
      this.isParserSub.unsubscribe();
    }
  }
}
