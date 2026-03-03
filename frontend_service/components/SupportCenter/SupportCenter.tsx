"use client";

import { Button, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useMemo, useRef, useState } from "react";
import supportCenterStyles from "./SupportCenterStyles";
import { useAlerts, useChat } from "./hooks/useSupportSockets";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchDevicesByUser } from "@/store/devices/device-thunks";
import { fetchAllUsers } from "@/store/users/user-thunks";

export default function SupportCenter() {
  const theme = useTheme();
  const classes = supportCenterStyles(theme);
  const dispatch = useDispatch<AppDispatch>();

  const { profile } = useSelector((state: RootState) => state.auth);
  const users = useSelector((state: RootState) => state.users.users);

  const userId = profile?.user_id ?? null;
  const isAdmin =
    (profile?.role ?? "CLIENT").toString().toUpperCase() === "ADMIN";

  const [input, setInput] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
    null
  );
  const chatEndRef = useRef<HTMLDivElement>(null);

  const adminUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const role = (user.role ?? "CLIENT").toString().toUpperCase();
      return role === "ADMIN";
    });
  }, [users]);

    const clientUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const role = (user.role ?? "CLIENT").toString().toUpperCase();
      return role === "CLIENT";
    });
  }, [users]);

  useEffect(() => {
    if (typeof userId === "number") dispatch(fetchAllUsers());
  }, [dispatch, userId]);

  useEffect(() => {
    if (!isAdmin && typeof userId === "number") {
      dispatch(fetchDevicesByUser({ user_id: userId }));
    }
  }, [dispatch, isAdmin, userId]);

  useEffect(() => {
    const list = isAdmin ? clientUsers : adminUsers;
    if (list.length === 0) {
      setSelectedPartnerId(null);
      return;
    }
    if (selectedPartnerId && list.some((u) => u.user_id === selectedPartnerId))
      return;
    setSelectedPartnerId(list[0]?.user_id ?? null);
  }, [isAdmin, clientUsers, adminUsers, selectedPartnerId]);

  const { sendMessage, messages, status } = useChat(userId, selectedPartnerId);
  useAlerts();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPartnerId]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (selectedPartnerId == null) {
      toast.info(
        isAdmin ? "Select a user first." : "No admins available right now."
      );
      return;
    }
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const headerLabel = isAdmin
    ? selectedPartnerId
      ? `Chatting with User #${selectedPartnerId}`
      : "Select a user"
    : selectedPartnerId
    ? `Chatting with Admin #${selectedPartnerId}`
    : "No admin available";

  return (
    <div style={classes.container}>
      <ToastContainer />

      <div style={classes.header}>
        <div style={classes.textContainer}>
          <span style={classes.title}>Support Center</span>
          <span style={classes.regularText}>{headerLabel}</span>
        </div>
        <div style={classes.statusIndicator}>
          Status:{" "}
          <span style={classes.statusText(status === "connected")}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {(isAdmin || adminUsers.length > 1) && (
        <div style={classes.selectWrapper}>
          <select
            value={selectedPartnerId ?? ""}
            onChange={(e) =>
              setSelectedPartnerId(Number(e.target.value) || null)
            }
            style={classes.selectInput}
          >
            <option value="" disabled>
              Select {isAdmin ? "user" : "admin"}
            </option>
            {(isAdmin ? clientUsers : adminUsers).map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.username} (#{u.user_id})
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={classes.panels}>
        <div style={classes.panel}>
          <div style={classes.chatList}>
            {messages.length === 0 ? (
              <div style={classes.emptyChat}>Start the conversation...</div>
            ) : (
              messages.map((msg, index) => {
                const variant =
                  msg.sender_id === 0
                    ? "system"
                    : msg.sender_id === userId
                    ? "outbound"
                    : "inbound";
                const senderLabel =
                  variant === "system"
                    ? "Bot"
                    : msg.sender_id === userId
                    ? "You"
                    : `User ${msg.sender_id}`;

                return (
                  <div
                    key={`${msg.sender_id}-${msg.timestamp}-${index}`}
                    style={classes.chatBubble(variant)}
                  >
                    <div style={classes.senderLabel}>{senderLabel}</div>
                    <div>{msg.message}</div>
                    <div style={classes.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={classes.chatFooter}>
            <textarea
              style={classes.chatInput}
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== "connected"}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={status !== "connected"}
              style={classes.sendButton}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
