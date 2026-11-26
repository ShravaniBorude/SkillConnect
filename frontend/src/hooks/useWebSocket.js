import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(token, subscriptions = []) {
  const clientRef = useRef(null);
  const subsRef = useRef(subscriptions);
  subsRef.current = subscriptions;

  useEffect(() => {
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || '/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        subsRef.current.forEach(({ destination, callback }) => {
          if (destination && callback) {
            client.subscribe(destination, (message) => {
              try {
                callback(JSON.parse(message.body));
              } catch {
                callback(message.body);
              }
            });
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [token]);

  const sendMessage = (destination, body) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
      return true;
    }
    return false;
  };

  return { sendMessage };
}
