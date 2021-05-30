import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather } from '../../entities/weather';

@Component({
  selector: 'app-wind',
  templateUrl: './wind.component.html',
  styleUrls: ['./wind.component.scss']
})
export class WindComponent implements OnInit {
  public windSpeed = 0;

  constructor(private currentWeatherService: CurrentWeatherService) { }

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather: Weather) => {
      this.windSpeed = weather.windSpeed;
    });
  }

}
