"use client";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import usersComponentStyles from "./UsersComponentStyles";
import { Button, IconButton, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/store/users/user-thunks";
import type { UserEntity } from "@/store/users/user-slice";
import AddUserModal, { UpsertUserPayload } from "./AddUserModal";

export default function UsersComponent() {
  const theme = useTheme();
  const classes = usersComponentStyles(theme);

  const users = useSelector((state: RootState) => state.users.users);
  const dispatch = useDispatch<AppDispatch>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <div style={classes.container}>
      <div style={classes.header}>
        <div style={classes.textContainer}>
          <span style={classes.title}>Users</span>
          <span style={classes.regularText}>
            Manage system users and their roles
          </span>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          style={{ ...classes.button }}
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      <div style={classes.row}>
        <div style={classes.headerCell}>User</div>
        <div style={classes.headerCell}>Email</div>
        <div style={classes.headerCell}>Address</div>
        <div style={classes.headerCell}>Role</div>
        <div style={{ ...classes.headerCell, justifyContent: "center" }}>
          Actions
        </div>
      </div>

      {Array.isArray(users) && users.length === 0 && (
        <div style={{ ...classes.row, height: "50px" }}>
          <div
            style={{
              ...classes.contentCell,
              fontWeight: 700,
              justifyContent: "center",
              gridColumn: "1 / -1",
            }}
          >
            No users found
          </div>
        </div>
      )}

      {Array.isArray(users) && users.length > 0 &&
        users.map((user) => {
          const normalizedRole = (user.role ?? "CLIENT")
            .toString()
            .trim()
            .toUpperCase();
          const isAdmin = normalizedRole === "ADMIN";
          return (
          <div key={user.user_id} style={{ ...classes.row, height: "50px" }}>
            <div style={{ ...classes.contentCell, gap: 8 }}>
              <AccountCircleIcon fontSize="small" />
              {user.username}
            </div>
            <div style={classes.contentCell}>{user.email}</div>
            <div style={classes.contentCell}>{user.address ?? "-"}</div>
            <div style={classes.contentCell}>
              <span style={classes.rolePill(normalizedRole)}>
                {isAdmin ? "admin" : "client"}
              </span>
            </div>
            <div style={{ ...classes.contentCell, justifyContent: "center" }}>
              <IconButton
                children={<EditIcon />}
                onClick={() => {
                  setEditingUser(user);
                  setIsModalOpen(true);
                }}
              />
              <IconButton
                disabled={isAdmin}
                children={<DeleteIcon sx={{ color: isAdmin ? "#9ca3af" : "red" }} />}
                onClick={() => {
                  if (user.user_id != null && !isAdmin) {
                    dispatch(deleteUser({ user_id: user.user_id }));
                  }
                }}
              />
            </div>
          </div>
        )})}

      <AddUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser ?? undefined}
        onSubmit={async (payload: UpsertUserPayload, mode: "add" | "edit") => {
          try {
            if (mode === "add") {
              await dispatch(
                createUser({
                  username: payload.username,
                  email: payload.email,
                  address: payload.address,
                  role: payload.role,
                })
              ).unwrap();
            } else if (payload.user_id != null) {
              await dispatch(
                updateUser({
                  user_id: payload.user_id,
                  dto: {
                    username: payload.username,
                    email: payload.email,
                    address: payload.address,
                    role: payload.role,
                  },
                })
              ).unwrap();
            }
            return null;
          } catch (err: any) {
            if (err === "USER_EXISTS") return "User already exists";
            return mode === "add"
              ? "Failed to create user"
              : "Failed to update user";
          }
        }}
      />
    </div>
  );
}
