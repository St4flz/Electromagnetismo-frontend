import { useEffect, useState, useCallback, useRef } from 'react';
import { physicsSocket } from '../services/physicsSocket';
import { PhysicsRequest, PhysicsResponse } from '../types/physics';

export function usePhysicsSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(physicsSocket.isConnected());
  const [lastResponse, setLastResponse] = useState<PhysicsResponse | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [computeTimeMs, setComputeTimeMs] = useState<number>(0);

  const throttleRef = useRef<number | null>(null);
  const pendingRequestRef = useRef<PhysicsRequest | null>(null);

  useEffect(() => {
    physicsSocket.connect();

    const unsubStatus = physicsSocket.onStatus((status) => {
      setIsConnected(status);
    });

    const unsubResponse = physicsSocket.subscribe((res) => {
      setLastResponse(res);
      setComputeTimeMs(res.computeTimeMs);
      if (res.error) {
        setLastError(res.error);
      } else {
        setLastError(null);
      }
    });

    const unsubError = physicsSocket.onError((err) => {
      setLastError(err);
    });

    return () => {
      unsubStatus();
      unsubResponse();
      unsubError();
    };
  }, []);

  const sendPhysicsRequest = useCallback((request: PhysicsRequest) => {
    pendingRequestRef.current = request;

    if (throttleRef.current === null) {
      // Enviar de inmediato si no hay throttle
      if (pendingRequestRef.current) {
        physicsSocket.send(pendingRequestRef.current);
        pendingRequestRef.current = null;
      }

      // Limitar a ~60fps (16ms)
      throttleRef.current = window.setTimeout(() => {
        throttleRef.current = null;
        if (pendingRequestRef.current) {
          physicsSocket.send(pendingRequestRef.current);
          pendingRequestRef.current = null;
        }
      }, 16);
    }
  }, []);

  return {
    isConnected,
    lastResponse,
    lastError,
    computeTimeMs,
    sendPhysicsRequest,
  };
}
