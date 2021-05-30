import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather } from '../../entities/weather';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.scss']
})
export class TemperatureComponent implements OnInit {

  constructor(private currentWeatherService: CurrentWeatherService) { }

  public barColor = "#354072";
  public temperature = 0;
  public minValue = -10;
  public maxValue = 100;
  public majorTicks = [-10, -0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  public highlights = '[{ "from": 0, "to": 49, "color": "rgba(38, 59, 119, .4)" },' +
    '{ "from": 50, "to": 79, "color": "rgba(246, 132, 32, .4)" },' +
    '{ "from": 80, "to": 100, "color": "rgba(190, 22, 14, .4)" }]'; 

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather:Weather) => {
      this.temperature = weather.temperature;

      if (weather.temperature < 0) {
        this.minValue = -30;
        this.maxValue = 60;
        this.majorTicks = [-30, -20, -10, -0, 10, 20, 30, 40, 50, 60];
        this.highlights = '[{ "from": -30, "to": 49, "color": "rgba(38, 59, 119, .4)" },'+
         '{ "from": 50, "to": 60, "color": "rgba(246, 132, 32, .4)" }]';
      }
      else if (weather.temperature >= 0 && weather.temperature <= 20 ) {
        this.minValue = -10;
        this.maxValue = 80;
        this.majorTicks = [-10, -0, 10, 20, 30, 40, 50, 60, 70, 80];
        this.highlights = '[{ "from": -10, "to": 49, "color": "rgba(38, 59, 119, .4)" },'+
         '{ "from": 50, "to": 80, "color": "rgba(246, 132, 32, .4)" }]';
      }
      else if (weather.temperature > 20 && weather.temperature < 100) {
        this.minValue = 0;
        this.maxValue = 100;
        this.majorTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        this.highlights = '[{ "from": 0, "to": 49, "color": "rgba(38, 59, 119, .4)" },' +
          '{ "from": 50, "to": 79, "color": "rgba(246, 132, 32, .4)" },' +
          '{ "from": 80, "to": 100, "color": "rgba(190, 22, 14, .4)" }]';
      }
      else
      {
        this.minValue = 30;
        this.maxValue = 120;
        this.majorTicks = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
        this.highlights = '[{ "from": 30, "to": 49, "color": "rgba(38, 59, 119, .4)" },' +
          '{ "from": 50, "to": 79, "color": "rgba(246, 132, 32, .4)" },'+
          '{ "from": 80, "to": 120, "color": "rgba(190, 22, 14, .4)" }]';
      }

    })
  }

}
