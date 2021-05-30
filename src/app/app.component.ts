import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CurrentWeatherService } from './services/current-weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public url = "assets/weather.html";

  constructor(public sanitizer: DomSanitizer,
    public currentWeatherService: CurrentWeatherService) {
      this.currentWeatherService.getCurrentWeather();
  }
}