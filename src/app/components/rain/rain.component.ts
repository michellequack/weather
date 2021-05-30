import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather } from '../../entities/weather';

@Component({
  selector: 'app-rain',
  templateUrl: './rain.component.html',
  styleUrls: ['./rain.component.scss']
})
export class RainComponent implements OnInit {

  constructor(private currentWeatherService: CurrentWeatherService) { }

  public rainRate = 0.00;
  public dayRainTotal = 0.00;

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather: Weather) => {
      this.rainRate = weather.rainRate;
      this.dayRainTotal = weather.dayRainTotal;
    });
  }

}
