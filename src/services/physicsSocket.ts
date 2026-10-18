import { PhysicsRequest, PhysicsResponse } from '../types/physics';

type ResponseHandler = (res: PhysicsResponse) => void;
type ErrorHandler = (err: string) => void;
type StatusHandler = (connected: boolean) => void;

export class PhysicsSocketClient {
  private url: string;
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;
  private reconnectTimeout: number | null = null;

  private onResponseCallbacks: Set<ResponseHandler> = new Set();
  private onErrorCallbacks: Set<ErrorHandler> = new Set();
  private onStatusCallbacks: Set<StatusHandler> = new Set();

  constructor(url: string = 'ws://localhost:8000/ws/physics') {
    this.url = url;
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.notifyStatus(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const data: PhysicsResponse = JSON.parse(event.data);
          this.onResponseCallbacks.forEach((cb) => cb(data));
        } catch (e) {
          this.onErrorCallbacks.forEach((cb) => cb(`Error parseando respuesta WS: ${e}`));
        }
      };

      this.socket.onerror = () => {
        this.onErrorCallbacks.forEach((cb) => cb('Error en conexión WebSocket'));
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        this.notifyStatus(false);
        if (this.shouldReconnect) {
          this.reconnectTimeout = window.setTimeout(() => this.connect(), 2000);
        }
      };
    } catch (e) {
      this.isConnecting = false;
      this.notifyStatus(false);
      if (this.shouldReconnect) {
        this.reconnectTimeout = window.setTimeout(() => this.connect(), 2000);
      }
    }
  }

  public send(request: PhysicsRequest): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(request));
      return true;
    }
    return false;
  }

  public subscribe(onResponse: ResponseHandler): () => void {
    this.onResponseCallbacks.add(onResponse);
    return () => this.onResponseCallbacks.delete(onResponse);
  }

  public onStatus(onStatus: StatusHandler): () => void {
    this.onStatusCallbacks.add(onStatus);
    onStatus(this.isConnected());
    return () => this.onStatusCallbacks.delete(onStatus);
  }

  public onError(onError: ErrorHandler): () => void {
    this.onErrorCallbacks.add(onError);
    return () => this.onErrorCallbacks.delete(onError);
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.socket) {
      this.socket.close();
    }
  }

  private notifyStatus(connected: boolean): void {
    this.onStatusCallbacks.forEach((cb) => cb(connected));
  }
}

// Singleton export para reutilizar conexión en toda la app
export const physicsSocket = new PhysicsSocketClient();
