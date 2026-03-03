"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import loginComponentStyles from "./LoginComponentStyles";
import { useTheme, Button } from "@mui/material";
import Image from "next/image";
import FieldComponent from "../FieldComponent";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { loginUser } from "@/store/auth/auth-thunks";
import { clearAuthError } from "@/store/auth/auth-slice";

export default function LoginComponent() {
  const theme = useTheme();
  const classes = loginComponentStyles(theme);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth) as any;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const isFormValid =
    identifier.trim().length > 0 && password.trim().length > 0;

  const isLoggingIn =
    authState.isLoading && authState.lastAction === "login";
  const loginError =
    authState.lastAction === "login" ? authState.error : null;

  useEffect(() => {
    if (authState.token && authState.profile) {
      const role = (authState.profile.role ?? "CLIENT").toString().toUpperCase();
      router.replace(role === "ADMIN" ? "/dashboard/users" : "/dashboard/devices");
    }
  }, [authState.profile, authState.token, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isLoggingIn) {
      return;
    }

    const payload =
      identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

    const resultAction = await dispatch(loginUser(payload));

    if (loginUser.fulfilled.match(resultAction)) {
      const nextRole = (resultAction.payload.user?.role ?? "CLIENT")
        .toString()
        .toUpperCase();
      router.push(
        nextRole === "ADMIN" ? "/dashboard/users" : "/dashboard/devices"
      );
    }
  };

  return (
    <div style={classes.container}>
      <div style={classes.loginContainer}>
        <Image
          src="/images/energy_image.png"
          alt="Logo"
          width={70}
          height={70}
        />
        <span style={{ ...classes.title, marginTop: "20px" }}>
          Energy Management System
        </span>
        <span style={classes.boldText}>
          Sign in to manage your smart energy devices
        </span>
        <form style={classes.formContainer} onSubmit={handleSubmit}>
          <FieldComponent
            type="text"
            label="Username / Email"
            placeholder="Enter your username or email"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <FieldComponent
            type="password"
            label="Password"
            placeholder="Enter your password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {loginError ? (
            <span style={classes.errorText}>{loginError}</span>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            style={{ ...classes.button, marginTop: "25px" }}
            disabled={!isFormValid || isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <span
          style={{
            ...classes.boldText,
            marginTop: "40px",
            fontSize: "0.9rem",
          }}
        >
          Don't have an account?{" "}
          <span
            style={{ ...classes.signUp }}
            onClick={() => {
              router.push("/signup");
            }}
          >
            Sign Up
          </span>
        </span>
      </div>
    </div>
  );
}
