"use client";

import {
  Button,
  Dialog,
  DialogContent,
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import FieldComponent from "../FieldComponent";
import addDeviceModalStyles from "./AddDeviceModalStyles";
import type { DeviceEntity } from "@/store/devices/device-slice";
import type { UserEntity } from "@/store/users/user-slice";

export interface UpsertDevicePayload {
  device_id?: number; // present in edit mode
  device_name: string;
  description: string;
  location: string;
  consumption_value: number;
  linked_user_ids?: number[];
}

export default function AddDeviceModal({
  open,
  onClose,
  device,
  onSubmit,
  users,
  initialLinkedUserIds,
  linksLoading,
  canManageLinks = true,
}: {
  open: boolean;
  onClose: () => void;
  device?: DeviceEntity | null;
  onSubmit?: (
    payload: UpsertDevicePayload,
    mode: "add" | "edit"
  ) => Promise<string | null> | string | void;
  users?: UserEntity[] | null;
  initialLinkedUserIds?: number[];
  linksLoading?: boolean;
  canManageLinks?: boolean;
}) {
  const theme = useTheme();
  const classes = addDeviceModalStyles(theme);

  const mode = useMemo<"add" | "edit">(() => (device ? "edit" : "add"), [device]);

  const [deviceName, setDeviceName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [maxConsumption, setMaxConsumption] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (device) {
      setDeviceName(device.device_name ?? "");
      setDescription(device.description ?? "");
      setLocation(device.location ?? "");
      setMaxConsumption(String(device.consumption_value ?? ""));
    } else {
      setDeviceName("");
      setDescription("");
      setLocation("");
      setMaxConsumption("");
    }
    setError(null);
  }, [device, open]);

  useEffect(() => {
    if (initialLinkedUserIds && initialLinkedUserIds.length > 0) {
      setSelectedUserIds(initialLinkedUserIds);
    } else {
      setSelectedUserIds([]);
    }
  }, [initialLinkedUserIds, open, mode]);

  const toggleUserSelection = (userId?: number) => {
    if (typeof userId !== "number") return;
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    const numericConsumption = Number(maxConsumption);
    const canSubmit =
      deviceName.trim().length > 0 &&
      description.trim().length > 0 &&
      location.trim().length > 0 &&
      !Number.isNaN(numericConsumption) &&
      numericConsumption > 0;

    if (!canSubmit) {
      return;
    }

    const payload: UpsertDevicePayload = {
      device_id: device?.device_id,
      device_name: deviceName,
      description,
      location,
      consumption_value: numericConsumption,
      linked_user_ids: mode === "edit" ? selectedUserIds : undefined,
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
          <span style={classes.title}>{mode === "add" ? "Add Device" : "Edit Device"}</span>
          <span style={classes.subtitle}>
          {mode === "add" ? "Provide device details below" : "Update the device details"}
          </span>

          <form style={classes.form} onSubmit={(e) => e.preventDefault()}>
            <FieldComponent
              type="text"
              label="Device name"
              placeholder="Enter device name"
              name="device_name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
            <FieldComponent
              type="text"
              label="Description"
              placeholder="Enter description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <FieldComponent
              type="text"
              label="Location"
              placeholder="Enter location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <FieldComponent
              type="number"
              label="Max consumption (KWH)"
              placeholder="Enter max consumption"
              name="consumption_value"
              value={maxConsumption}
              onChange={(e) => setMaxConsumption(e.target.value)}
            />
          </form>
          {mode === "edit" && canManageLinks ? (
            <div style={classes.linkSection}>
              <span style={classes.linkTitle}>Link users</span>
              {linksLoading ? (
                <span style={classes.linkEmpty}>Loading linked users...</span>
              ) : Array.isArray(users) && users.length > 0 ? (
                <div style={classes.linkList}>
                  {users.map((user) => (
                    <FormControlLabel
                      key={user.user_id ?? user.email}
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            typeof user.user_id === "number" &&
                            selectedUserIds.includes(user.user_id)
                          }
                          onChange={() => toggleUserSelection(user.user_id)}
                          disabled={typeof user.user_id !== "number"}
                        />
                      }
                      label={`${user.username} (${user.email})`}
                    />
                  ))}
                </div>
              ) : (
                <span style={classes.linkEmpty}>No users available</span>
              )}
            </div>
          ) : null}
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
                deviceName.trim() &&
                description.trim() &&
                location.trim() &&
                maxConsumption.trim() &&
                Number(maxConsumption) > 0
              )}
              onClick={handleSubmit}
            >
              {mode === "add" ? "Add device" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
