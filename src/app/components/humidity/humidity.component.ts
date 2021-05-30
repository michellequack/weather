import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather } from '../../entities/weather';

@Component({
  selector: 'app-humidity',
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.scss']
})
export class HumidityComponent implements OnInit {

  public humidity = 50;
  constructor(private currentWeatherService: CurrentWeatherService) { }

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather: Weather) => {
      this.humidity = weather.humidity;
    });
  }

}
