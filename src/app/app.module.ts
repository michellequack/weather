import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GaugesModule } from '@biacsics/ng-canvas-gauges';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CurrentWeatherService } from './services/current-weather.service';
import { RadarComponent } from './components/radar/radar.component';
import { TemperatureComponent } from './components/temperature/temperature.component';
import { HumidityComponent } from './components/humidity/humidity.component';
import { WindComponent } from './components/wind/wind.component';
import { RainComponent } from './components/rain/rain.component';
import { BarometerComponent } from './components/barometer/barometer.component';
import { CelestialComponent } from './components/celestial/celestial.component';
import { ForecastComponent } from './components/forecast/forecast.component';

@NgModule({
  declarations: [
    AppComponent,
    RadarComponent,
    TemperatureComponent,
    HumidityComponent,
    WindComponent,
    RainComponent,
    BarometerComponent,
    CelestialComponent,
    ForecastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FlexLayoutModule,
    GaugesModule
  ],
  providers: [CurrentWeatherService],
  bootstrap: [AppComponent]
})
export class AppModule { }
