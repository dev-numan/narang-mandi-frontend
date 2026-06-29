import { io } from 'socket.io-client';

// In dev, VITE_API_BASE is empty and Vite proxies /socket.io to the backend.
// In prod, VITE_API_BASE is the API origin the socket should connect to.
const URL = import.meta.env.VITE_API_BASE || undefined;

let socket;

// Single shared connection, created lazily on first use.
export function getSocket() {
  if (!socket) {
    socket = io(URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}
