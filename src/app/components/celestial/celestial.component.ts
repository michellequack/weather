import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather } from '../../entities/weather';


@Component({
  selector: 'app-celestial',
  templateUrl: './celestial.component.html',
  styleUrls: ['./celestial.component.scss']
})
export class CelestialComponent implements OnInit {

  public sunrise: string = "";
  public sunset: string = "";

  public moonPhase: string = "";
  public moonPercent: number = 0;

  public moonImage: string = "";

  constructor(private currentWeatherService: CurrentWeatherService) { }

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather: Weather) => {
      this.sunrise = weather.sunrise;
      this.sunset = weather.sunset;
      this.moonPhase = weather.moonPhase;
      this.moonPercent = weather.moonPercent;

      switch(weather.moonPhase) {
        case 'New':
          this.moonImage = '../../../assets/img/moon/moon-new.png';
          break;
        case 'Waxing crescent':
          this.moonImage = '../../../assets/img/moon/moon-waxing-crescent.png';
          break;
        case 'First quarter':
          this.moonImage = '../../../assets/img/moon/moon-first-quarter.png';
          break;
        case 'Waxing gibbous':
          this.moonImage = '../../../assets/img/moon/moon-waxing-gibbous.png';
          break;
        case 'Full':
          this.moonImage = '../../../assets/img/moon/moon-full.png';
          break;
        case 'Waning gibbous':
          this.moonImage = '../../../assets/img/moon/moon-waning-gibbous.png';
          break;
        case 'Last quarter':
          this.moonImage = '../../../assets/img/moon/moon-last-quarter.png';
          break;
        case 'Waning crescent':
          this.moonImage = '../../../assets/img/moon/moon-waning-crescent.png';
          break;
      }
    });
  }

}
