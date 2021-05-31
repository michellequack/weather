import { Component, OnInit } from '@angular/core';
import { CurrentWeatherService } from '../../services/current-weather.service';
import { Weather, BarometerSeries } from '../../entities/weather';

@Component({
  selector: 'app-barometer',
  templateUrl: './barometer.component.html',
  styleUrls: ['./barometer.component.scss']
})
export class BarometerComponent implements OnInit {

  public yAxisTickFormattingFn = this.yAxisTickFormatting.bind(this);
  public xAxisTickFormattingFn = this.xAxisTickFormatting.bind(this);

  public showLegend: boolean = false;
  public showLabels: boolean = true;
  public animations: boolean = true;
  public showXAxis: boolean = true;
  public showYAxis: boolean = true;
  public showYAxisLabel: boolean = true;
  public showXAxisLabel: boolean = false;
  public xAxisLabel: string = 'Time';
  public yAxisLabel: string = 'Pressure';
  public timeline: boolean = false;
  public autoScale: boolean = true;
  public gradient: boolean = false;
  public colorScheme = {
    domain: ['#1D3F72']
  };
  public view: any = [700, 400];

  public chartData: any[] = [];

  constructor(private currentWeatherService: CurrentWeatherService) { }

  ngOnInit(): void {
    this.currentWeatherService.weatherInfo.subscribe((weather: Weather) => {
      this.chartData = weather.barometerSeriesArray;
    });
  }

  yAxisTickFormatting(value: any) {
    return parseFloat(value).toFixed(0);
  }

  xAxisTickFormatting(value: any) {
    return '  ' + value;
  }
  
}
