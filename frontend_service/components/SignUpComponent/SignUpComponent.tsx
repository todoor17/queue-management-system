"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import signUpComponentStyles from "./SignUpComponentStyles";
import { useTheme, Button } from "@mui/material";
import Image from "next/image";
import FieldComponent from "../FieldComponent";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { registerUser } from "@/store/auth/auth-thunks";
import { clearAuthError } from "@/store/auth/auth-slice";

export default function SignUpComponent() {
  const theme = useTheme();
  const classes = signUpComponentStyles(theme);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const isFormValid =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    address.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    password === confirmPassword;

  const isRegisterLoading =
    authState.isLoading && authState.lastAction === "register";
  const registerError =
    authState.lastAction === "register" ? authState.error : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isRegisterLoading) {
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        username,
        email,
        password,
        address,
        role: "CLIENT",
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      router.push("/login");
    }
  };

  const passwordMismatch =
    password !== confirmPassword && confirmPassword
      ? "Passwords do not match"
      : null;
  const errorMessage = registerError ?? passwordMismatch;

  return (
    <div style={classes.container}>
      <div style={classes.signUpContainer}>
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
          Sign up to manage your smart energy devices
        </span>
        <form style={classes.formContainer} onSubmit={handleSubmit}>
          <FieldComponent
            type="text"
            label="Username"
            placeholder="Enter your username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FieldComponent
            type="email"
            label="Email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldComponent
            type="password"
            label="Password"
            placeholder="Enter your password (min 8 characters)"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldComponent
            type="password"
            label="Confirm password"
            placeholder="Enter your password again"
            name="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FieldComponent
            type="text"
            label="Address"
            placeholder="Enter your address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errorMessage ? (
            <span style={classes.errorText}>{errorMessage}</span>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            sx={{
              ...classes.button,
              marginTop: "25px",
              "&.Mui-disabled": {
                backgroundColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
            disabled={!isFormValid || isRegisterLoading}
          >
            {isRegisterLoading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <span
          style={{
            ...classes.boldText,
            marginTop: "40px",
            fontSize: "0.9rem",
          }}
        >
          Already have an account?{" "}
          <span
            style={{ ...classes.signIn }}
            onClick={() => {
              router.push("/login");
            }}
          >
            Sign In
          </span>
        </span>
      </div>
    </div>
  );
}
