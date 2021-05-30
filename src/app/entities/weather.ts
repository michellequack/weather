export class Weather {
  public recordTime: string = "";
  public temperature: number = 0;
  public windChill: number = 0;
  public heatIndex: number = 0;
  public humidity: number = 0;
  public windSpeed: number = 0;
  public windDirection: string = "";
  public rainRate: number = 0;
  public dayRainTotal: number = 0;
  public sunrise: string = "";
  public sunset: string = "";
  public moonPhase: string = "";
  public moonPercent: string = "";
  public barometer: Barometer[] = new Array;
}

export class Barometer {
  public timeEpoch: number = 0;
  public pressure: number = 0;
}