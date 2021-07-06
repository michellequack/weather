import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs'
import { DayInfo } from '../entities/forecast';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  public forecast = new BehaviorSubject([]);

  constructor(private httpClient: HttpClient) { }

  public getCurrentForecast() {
    const url = 'https://api.weather.gov/gridpoints/RNK/63,64/forecast';

    this.httpClient.get(url, { responseType: 'json' }).subscribe((response) => {
      this.processDays(response);
    });
  }

  processDays(result: any) {
    var dayMap = [];

    var forecastArray = result.properties.periods.slice(0, 14);

    forecastArray.forEach((forecastItem: any) => {
      // Figure out which day the forecast is for
      var dayName = forecastItem.name;

      // Get the dictionary object for this day
      var dayObject = new DayInfo();

      dayObject.temperature = Math.round(forecastItem.temperature);

      var icon = forecastItem.icon;
      var start = 0;
      if (forecastItem.isDaytime) {
        start = icon.indexOf('/day');
      }
      else {
        start = icon.indexOf('/night');
      }
      var questionPos = icon.indexOf('?', start);
      icon = icon.substring(start, questionPos);
      if (icon.indexOf(',') > -1) {
        var commaPos = icon.indexOf(',');
        icon = icon.substring(0, commaPos);
      }

      var searchTerm = 'day/';
      if (!forecastItem.isDaytime) {
        searchTerm = 'night/';
      }

      var searchTermPos = icon.indexOf(searchTerm);
      var extraSlashPos = icon.indexOf('/', searchTermPos + searchTerm.length + 1);

      if (extraSlashPos > -1) {
        icon = icon.substring(0, extraSlashPos);
      }

      icon = `../../assets/img/forecast${icon}.png`;

      dayObject.icon = icon;
      dayObject.forecastString = forecastItem.shortForecast;


      var testString = 'Chance of precipitation is ';
      if (forecastItem.detailedForecast.indexOf(testString) > -1) {
        // We have rain
        var posRain = forecastItem.detailedForecast.indexOf(testString) + testString.length;
        var posPercent = forecastItem.detailedForecast.indexOf('%', posRain);
        var popChance = forecastItem.detailedForecast.substring(posRain, posPercent);

        dayObject.popChance = popChance + '%';
      }

      dayObject.dayName = dayName;
      dayObject.isDaytime = forecastItem.isDaytime;
      dayMap.push(dayObject);
    });
    this.forecast.next(dayMap);
  }
}

