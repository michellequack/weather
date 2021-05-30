import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.scss']
})
export class RadarComponent implements OnInit {

  public url = "";
  constructor() { }

  ngOnInit(): void {
    const url = window.location.search.substring(1).split(",");
  }

}
