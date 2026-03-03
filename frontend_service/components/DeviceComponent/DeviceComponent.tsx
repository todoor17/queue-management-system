"use client";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import deviceComponentStyles from "./DeviceComponentStyles";
import { Button, IconButton, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchAllDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getUsersForDevice,
  linkDeviceToUser,
  unlinkDeviceFromUser,
  fetchDevicesByUser,
} from "@/store/devices/device-thunks";
import { fetchAllUsers } from "@/store/users/user-thunks";
import AddDeviceModal, { UpsertDevicePayload } from "./AddDeviceModal";
import type { DeviceEntity } from "@/store/devices/device-slice";

export default function DeviceComponent() {
  const theme = useTheme();
  const classes = deviceComponentStyles(theme);
  const router = useRouter();

  const devices = useSelector((state: RootState) => state.devices.devices);
  const users = useSelector((state: RootState) => state.users.users);
  const authProfile = useSelector((state: RootState) => state.auth.profile);
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceEntity | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [linkedUserIds, setLinkedUserIds] = useState<number[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  const normalizedRole = (authProfile?.role ?? "CLIENT")
    .toString()
    .toUpperCase();
  const isAdmin = normalizedRole === "ADMIN";
  const currentUserId = authProfile?.user_id;

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllDevices());
      dispatch(fetchAllUsers());
    } else if (typeof currentUserId === "number") {
      dispatch(fetchDevicesByUser({ user_id: currentUserId }));
    }
  }, [dispatch, isAdmin, currentUserId]);

  return (
    <div style={classes.deviceContainer}>
      <div style={classes.header}>
        <div style={classes.textContainer}>
          <span style={classes.title}>Devices</span>
          <span style={classes.regularText}>
            Manage devices and assignments
          </span>
        </div>
        {isAdmin ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            style={{ ...classes.button }}
            onClick={() => {
              setEditingDevice(null);
              setLinkedUserIds([]);
              setLinksLoading(false);
              setIsModalOpen(true);
            }}
          >
            Add device
          </Button>
        ) : null}
      </div>

      {tableError ? (
        <div
          style={{
            ...classes.rowContainer,
            border: "none",
          }}
        >
          <div
            style={{
              ...classes.contentCell,
              fontWeight: 700,
              color: "#dc2626",
              justifyContent: "center",
              gridColumn: "1 / -1",
            }}
          >
            {tableError}
          </div>
        </div>
      ) : null}

      <div style={classes.rowContainer}>
        <div style={classes.headerCell}>Device</div>
        <div style={classes.headerCell}>Description</div>
        <div style={classes.headerCell}>Location</div>
        <div style={classes.headerCell}>Max consumption</div>
        <div style={classes.headerCell}>Linked</div>
        <div style={{ ...classes.headerCell, justifyContent: "center" }}>
          Actions
        </div>
      </div>
      {Array.isArray(devices) && devices.length === 0 && (
        <div
          style={{
            ...classes.rowContainer,
            height: "50px",
            border: "none",
          }}
        >
          <div
            style={{
              ...classes.contentCell,
              fontWeight: 700,
              justifyContent: "center",
              gridColumn: "1 / -1",
            }}
          >
            No devices found
          </div>
        </div>
      )}
      {Array.isArray(devices) &&
        devices.length > 0 &&
        devices.map((device) => {
          const isLinked = Boolean(device.is_linked);
          return (
            <div
              style={{ ...classes.rowContainer, height: "50px" }}
              key={device.device_id}
            >
              <div
                style={{
                  ...classes.contentCell,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  if (device.device_id != null) {
                    router.push(`/dashboard/devices/${device.device_id}`);
                  }
                }}
              >
                {device.device_name}
              </div>
              <div style={classes.contentCell}>{device.description}</div>
              <div style={classes.contentCell}>{device.location}</div>
              <div
                style={classes.contentCell}
              >{`${device.consumption_value} KWH`}</div>
              <div style={classes.contentCell}>
                <span style={classes.linkedIndicator(isLinked)} />
                {isLinked ? "Yes" : "No"}
              </div>
              <div style={{ ...classes.contentCell, justifyContent: "center" }}>
                <IconButton
                  children={<EditIcon />}
                  onClick={async () => {
                    setEditingDevice(device);
                    setIsModalOpen(true);
                    setLinkedUserIds([]);
                    if (isAdmin && device.device_id != null) {
                      setLinksLoading(true);
                      try {
                        const response = await dispatch(
                          getUsersForDevice({ device_id: device.device_id })
                        ).unwrap();
                        setLinkedUserIds(response.user_ids ?? []);
                      } catch (err) {
                        console.error("Failed to fetch linked users", err);
                        setLinkedUserIds([]);
                      } finally {
                        setLinksLoading(false);
                      }
                    } else {
                      setLinksLoading(false);
                    }
                  }}
                />
                {isAdmin ? (
                  <IconButton
                    disabled={isLinked}
                    children={
                      <DeleteIcon
                        sx={{ color: isLinked ? "#9ca3af" : "red" }}
                      />
                    }
                    onClick={async () => {
                      if (device.device_id != null && !isLinked) {
                        try {
                          await dispatch(
                            deleteDevice({ device_id: device.device_id })
                          ).unwrap();
                          setTableError(null);
                        } catch (err: any) {
                          if (err === "DEVICE_LINKED") {
                            setTableError(
                              "Cannot delete a linked device. Unlink it first."
                            );
                          } else {
                            setTableError("Failed to delete device");
                          }
                        }
                      }
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}

      <AddDeviceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        device={editingDevice ?? undefined}
        users={isAdmin ? users ?? undefined : undefined}
        canManageLinks={isAdmin}
        initialLinkedUserIds={linkedUserIds}
        linksLoading={linksLoading}
        onSubmit={async (
          payload: UpsertDevicePayload,
          mode: "add" | "edit"
        ) => {
          try {
            if (mode === "add") {
              if (!isAdmin) {
                return "You are not allowed to add devices";
              }
              await dispatch(
                createDevice({
                  device_name: payload.device_name,
                  description: payload.description,
                  location: payload.location,
                  consumption_value: payload.consumption_value,
                })
              ).unwrap();
            } else if (payload.device_id != null) {
              await dispatch(
                updateDevice({
                  device_id: payload.device_id,
                  dto: {
                    device_name: payload.device_name,
                    description: payload.description,
                    location: payload.location,
                    consumption_value: payload.consumption_value,
                  },
                  refreshMode: isAdmin ? "all" : "none",
                })
              ).unwrap();
              if (isAdmin && editingDevice?.device_id != null) {
                const next = payload.linked_user_ids ?? linkedUserIds;
                const previous = linkedUserIds;
                const toLink = next.filter((id) => !previous.includes(id));
                const toUnlink = previous.filter((id) => !next.includes(id));

                for (const userId of toLink) {
                  try {
                    await dispatch(
                      linkDeviceToUser({
                        device_id: editingDevice.device_id,
                        user_id: userId,
                      })
                    ).unwrap();
                  } catch (err: any) {
                    return typeof err === "string"
                      ? err
                      : "Failed to link user";
                  }
                }

                for (const userId of toUnlink) {
                  try {
                    await dispatch(
                      unlinkDeviceFromUser({
                        device_id: editingDevice.device_id,
                        user_id: userId,
                      })
                    ).unwrap();
                  } catch (err: any) {
                    return typeof err === "string"
                      ? err
                      : "Failed to unlink user";
                  }
                }

                setLinkedUserIds(next);
              } else if (!isAdmin && typeof currentUserId === "number") {
                await dispatch(
                  fetchDevicesByUser({ user_id: currentUserId })
                ).unwrap();
              }
            }
            setTableError(null);
            return null;
          } catch (err: any) {
            if (err === "DEVICE_EXISTS") {
              return "A device with that name already exists";
            }
            if (err === "DEVICE_NOT_FOUND") {
              return "Device not found";
            }
            if (err === "DEVICE_LINKED") {
              return "Cannot update a linked device";
            }
            return mode === "add"
              ? "Failed to create device"
              : "Failed to update device";
          }
        }}
      />
    </div>
  );
}
