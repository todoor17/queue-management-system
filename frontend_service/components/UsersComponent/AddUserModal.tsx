"use client";

import { Button, Dialog, DialogContent, useTheme } from "@mui/material";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import FieldComponent from "../FieldComponent";
import addUserModalStyles from "./AddUserModalStyles";
import type { UserEntity } from "@/store/users/user-slice";

export interface UpsertUserPayload {
  user_id?: number;
  username: string;
  email: string;
  address?: string | null;
  role?: string | null;
}

export default function AddUserModal({
  open,
  onClose,
  user,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  user?: UserEntity | null;
  onSubmit?: (
    payload: UpsertUserPayload,
    mode: "add" | "edit"
  ) => Promise<string | null> | string | void;
}) {
  const theme = useTheme();
  const classes = addUserModalStyles(theme);

  const mode = useMemo<"add" | "edit">(() => (user ? "edit" : "add"), [user]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setAddress(user.address ?? "");
      setRole((user.role ?? "CLIENT").toString().trim().toUpperCase());
    } else {
      setUsername("");
      setEmail("");
      setAddress("");
      setRole("CLIENT");
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async () => {
    const isRoleValid = ["ADMIN", "CLIENT"].includes(role.trim().toUpperCase());
    const canSubmit =
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      role.trim().length > 0 &&
      isRoleValid;
    if (!canSubmit) return;
    const payload: UpsertUserPayload = {
      user_id: user?.user_id,
      username,
      email,
      address,
      role,
    };
    const result = await onSubmit?.(payload, mode);
    if (typeof result === "string" && result) {
      setError(result);
      return;
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <div style={classes.container}>
          <Image src="/images/energy_image.png" alt="Logo" width={50} height={50} />
          <span style={classes.title}>{mode === "add" ? "Add User" : "Edit User"}</span>
          <span style={classes.subtitle}>
            {mode === "add" ? "Provide user details below" : "Update the user details"}
          </span>

          <form style={classes.form} onSubmit={(e) => e.preventDefault()}>
            <FieldComponent
              type="text"
              label="Username"
              placeholder="Enter username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FieldComponent
              type="email"
              label="Email"
              placeholder="Enter email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldComponent
              type="text"
              label="Address"
              placeholder="Enter address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <FieldComponent
              type="text"
              label="Role (ADMIN/CLIENT)"
              placeholder="CLIENT"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value.trim().toUpperCase())}
            />
          </form>
          {error ? <span style={classes.errorText}>{error}</span> : null}

          <div style={classes.actions}>
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                ...classes.button,
                "&.Mui-disabled": {
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              }}
              disabled={!(
                username.trim() &&
                email.trim() &&
                role.trim() &&
                ["ADMIN", "CLIENT"].includes(role.trim().toUpperCase())
              )}
              onClick={handleSubmit}
            >
              {mode === "add" ? "Add user" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
