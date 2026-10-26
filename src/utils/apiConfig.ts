/**
 * Configuración centralizada de endpoints REST y WebSockets para comunicación con FastAPI.
 *
 * Resuelve automáticamente el puerto cuando el frontend corre en el servidor de desarrollo de Vite
 * (puerto 5173 u otro) y el backend de cómputo en Python FastAPI corre en el puerto 8000.
 */

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // Si estamos en un puerto distinto al 8000 (desarrollo Vite), conectar al backend en 8000
    if (port && port !== '8000') {
      return `http://${window.location.hostname}:8000${cleanPath}`;
    }
  }
  return cleanPath;
}

export function getWsUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const port = window.location.port;
    if (port && port !== '8000') {
      return `${protocol}//${window.location.hostname}:8000${cleanPath}`;
    }
    return `${protocol}//${window.location.host}${cleanPath}`;
  }
  return `ws://localhost:8000${cleanPath}`;
}
