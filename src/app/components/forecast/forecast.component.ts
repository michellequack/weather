import { Component, OnInit } from '@angular/core';
import { ForecastService } from '../../services/forecast.service';
import { DayInfo } from '../../entities/forecast';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {

  public forecast = [];
  constructor(private forecastService: ForecastService) { }

  ngOnInit(): void {
    this.forecastService.forecast.subscribe((foreCastInfo) => {
      this.forecast = foreCastInfo;
    });
  }

}
