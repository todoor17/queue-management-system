let USERS_BASE = "http://localhost:8000/users";
let AUTH_BASE = "http://localhost:8001/auth";
let DEVICE_BASE = "http://localhost:8002/devices";
let MONITORING_BASE = "http://localhost:8003/monitoring";
let WS_BASE = "ws://localhost:8004";

let local = false;

if (!local) {
  USERS_BASE = "http://user.localhost/users";
  AUTH_BASE = "http://auth.localhost/auth";
  DEVICE_BASE = "http://device.localhost/devices";
  MONITORING_BASE = "http://monitoring.localhost/monitoring";
  WS_BASE = "ws://ws.localhost";
}

export { USERS_BASE, AUTH_BASE, DEVICE_BASE, MONITORING_BASE, WS_BASE };
