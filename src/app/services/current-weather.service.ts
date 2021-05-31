import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Weather, BarometerSeriesItem, BarometerSeries } from '../entities/weather';
import { BehaviorSubject } from 'rxjs'
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CurrentWeatherService {
  public weatherInfo = new BehaviorSubject(new Weather());

  constructor(private httpClient: HttpClient) { }

  public getCurrentWeather() {
    const url = 'http://localhost:3000/current_weather';
    this.httpClient.get(url, { responseType: 'text' }).subscribe((response) => {
      const weather: Weather = JSON.parse(response.toString());

      weather.barometerSeriesArray = new Array;

      const barometerSeries = new BarometerSeries;
      barometerSeries.name = 'Barometer';

      let celestialTimePart = weather.sunrise.substring(0, 5);
      let celestialAmPm = weather.sunrise.substring(8, 11);
      weather.sunrise = celestialTimePart + celestialAmPm
      if(weather.sunrise.substring(0, 1) == '0')
      {
        weather.sunrise = weather.sunrise.substring(1);
      }

      celestialTimePart = weather.sunset.substring(0, 5);
      celestialAmPm = weather.sunset.substring(8, 11);
      weather.sunset = celestialTimePart + celestialAmPm
      if (weather.sunset.substring(0, 1) == '0') {
        weather.sunset = weather.sunset.substring(1);
      }

      weather.barometer.forEach((item) => {
        const timeString = this.getTimeFromEpoch(item[0]);
        const pressureValue = parseFloat(parseFloat(item[1]).toFixed(1));
       
        const barometerItem = new BarometerSeriesItem()
        barometerItem.name = timeString;
        barometerItem.value = pressureValue;

        barometerSeries.series.push(barometerItem);
      });
      weather.barometerSeriesArray.push(barometerSeries);
      this.weatherInfo.next(weather);
    });
  }

  private getTimeFromEpoch(epoch: number): string {
    const date = new Date(epoch * 1000);
    const timeString = formatDate(date, 'HH:mm', 'en-US');
    return timeString;
  }
}
