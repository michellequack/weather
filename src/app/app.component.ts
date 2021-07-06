import { Component } from '@angular/core';
import { CurrentWeatherService } from './services/current-weather.service';
import { ForecastService } from './services/forecast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public currentWeatherService: CurrentWeatherService,
    public forecastService: ForecastService) {
      this.currentWeatherService.getCurrentWeather();
      this.forecastService.getCurrentForecast();
  }
}