import { Socket } from 'socket.io';
import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module, { ModuleDataIn, ModuleDataOut } from '../module';

/**
 * Weather module.
 */
export default class WeatherModule extends Module {

  /**
   * Creates a new weather module.
   * 
   * @param container Services container
   * @param doc Module document
   */
  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container, doc);
  }

  public connect(socket: Socket): void {
    super.connect(socket);
    const metadata: WeatherModuleMetadata = this.metadata;
    if (metadata.apiKey) {
      this.send<WeatherModuleApiKeyDataOut>('api-key', { apiKey: metadata.apiKey });
    }
    if (metadata.lat && metadata.lon) {
      this.send<WeatherModuleLocationDataOut>('location', { lat: metadata.lat, lon: metadata.lon });
    }
  }

  /**
   * Sends AccuWeather API key.
   * 
   * @param apiKey AccuWeather API key
   */
  public sendApiKey(apiKey: string): void {
    this.updateMetadata<WeatherModuleMetadata>({ apiKey });
    this.send<WeatherModuleApiKeyDataOut>('api-key', { apiKey });
  }

  /**
   * Sends weather location.
   * 
   * @param lat Latitude
   * @param lon Longitude
   */
  public sendLocation(lat: number, lon: number): void {
    this.updateMetadata<WeatherModuleMetadata>({ lat, lon });
    this.send<WeatherModuleLocationDataOut>('location', { lat, lon });
  }

  protected registerListeners(): void {
    this.listening<WeatherModuleApiWeatherDataIn>('weather', data => console.log(data)); // TODO Write in LED strip
  }
}

/**
 * Weather module metadata.
 */
export interface WeatherModuleMetadata {
  apiKey?: string;
  lat?: number;
  lon?: number;
}

/**
 * Weather module data outgoing for `weather` event.
 */
export interface WeatherModuleApiWeatherDataIn extends ModuleDataIn {
  Value: number;
  Unit: string;
}

/**
 * Weather module data outgoing for `api-key` event.
 */
export interface WeatherModuleApiKeyDataOut extends ModuleDataOut {
  apiKey: string;
}

/**
 * Weather module data outgoing for `location` event.
 */
export interface WeatherModuleLocationDataOut extends ModuleDataOut {
  lat: number;
  lon: number;
}
