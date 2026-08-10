import { io } from 'socket.io-client';

// In dev, VITE_API_BASE is empty and Vite proxies /socket.io to the backend.
// In prod, VITE_API_BASE is the API origin the socket should connect to.
const URL = import.meta.env.VITE_API_BASE || undefined;

let socket;
/// The token the current connection was opened with. A handshake only runs
/// once, so logging in after the socket is up leaves it authenticated as
/// nobody until it is cycled — see `ensureAuth`.
let connectedWith = null;

const currentToken = () => localStorage.getItem('accessToken') || null;

// Single shared connection, created lazily on first use.
export function getSocket() {
  if (!socket) {
    connectedWith = currentToken();
    socket = io(URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      // A function, not an object: it is re-evaluated on every reconnect, so a
      // token that changes mid-session is picked up without extra plumbing.
      auth: (cb) => cb({ token: currentToken() ?? undefined }),
    });
  }
  return socket;
}

/**
 * Guarantees the live connection is authenticated as whoever is logged in now.
 *
 * Anonymous rooms (community chat) never need this. The driver's private room
 * does: the socket is usually already open — established while the visitor was
 * logged out — and the server decides room access from the handshake.
 */
export function ensureAuth() {
  const s = getSocket();
  const token = currentToken();
  if (token !== connectedWith) {
    connectedWith = token;
    s.disconnect();
    s.connect();
  }
  return s;
}
