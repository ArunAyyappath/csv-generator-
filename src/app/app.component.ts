import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'csv-generator';

  constructor(private titleService: Title ) {}

  ngOnInit() {
    this.setTitle(this.title);
  }

  setTitle = ( newTitle: string): void => {
    this.titleService.setTitle(newTitle);
  }
}
