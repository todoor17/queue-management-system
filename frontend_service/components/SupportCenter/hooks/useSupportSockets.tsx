import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { WS_BASE } from "@/env";

export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface ChatMessage {
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
}

const RECONNECT_DELAY_MS = 3000;

export const useChat = (
  senderId: number | null,
  receiverId: number | null
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const token = useSelector(
    (state: any) =>
      state.auth?.token ??
      (typeof window !== "undefined"
        ? window.localStorage.getItem("authToken")
        : null)
  );

  useEffect(() => {
    setMessages([]);
  }, [senderId, receiverId]);

  useEffect(() => {
    if (!token) {
      setStatus("disconnected");
      return;
    }
    if (typeof senderId !== "number" || typeof receiverId !== "number") {
      setStatus("disconnected");
      return;
    }
    if (!Number.isFinite(senderId) || !Number.isFinite(receiverId)) {
      setStatus("disconnected");
      return;
    }
    if (senderId === receiverId) {
      setStatus("error");
      return;
    }

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let shouldReconnect = true;

    const connect = () => {
      setStatus("connecting");
      const url = `${WS_BASE}/ws/chat?sender_id=${senderId}&receiver_id=${receiverId}&token=${encodeURIComponent(
        token
      )}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setStatus("connected");
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("Failed to parse chat message", error);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => {
        setStatus("error");
      };

      socketRef.current = ws;
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [senderId, receiverId, token]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }));
    } else {
      console.warn("Chat socket is not connected. Message was not sent.");
    }
  }, []);

  return { sendMessage, messages, status };
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const user = useSelector((state: any) => state.auth?.profile);
  const token = useSelector(
    (state: any) =>
      state.auth?.token ??
      (typeof window !== "undefined"
        ? window.localStorage.getItem("authToken")
        : null)
  );
  const role = user?.role;
  const isAdmin = role?.toString().toUpperCase() === "ADMIN";
  const devices = useSelector((state: any) => state.devices?.devices);
  const deviceIds = Array.isArray(devices)
    ? devices.map((d: any) => d.device_id)
    : [];

  useEffect(() => {
    if (!token) {
      return;
    }

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const ws = new WebSocket(
        `${WS_BASE}/ws/alerts?token=${encodeURIComponent(token)}`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (isAdmin || deviceIds.includes(data.device_id)) {
          toast.warn(
            <div>
              <strong>Alert from Device {data.device_id}</strong>
              <div style={{ fontSize: "0.85rem", marginTop: "5px" }}>
                Time: {new Date(data.timestamp).toLocaleString()} <br />
                Current:{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {data.value}
                </span>{" "}
                <br />
                Max Allowed: {data.max_consumption_value}
              </div>
            </div>,
            {
              toastId: `alert-${data.device_id}-${data.timestamp}`,
              position: "top-right",
              autoClose: 2000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          setAlerts((prev) => [data, ...prev]);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socketRef.current = ws;
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAdmin, deviceIds.join(","), token]);

  return { alerts };
};
