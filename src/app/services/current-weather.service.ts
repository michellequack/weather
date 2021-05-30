import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Weather } from '../entities/weather';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'

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
      this.weatherInfo.next(weather);
    });
  }
}
