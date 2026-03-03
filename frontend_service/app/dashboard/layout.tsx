"use client";

import styles from "./dashboard.module.css";

import { useEffect } from "react";

import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ManagementSwitcher from "@/components/ManagementSwitcher";
import { logout } from "@/store/auth/auth-slice";
import type { AppDispatch, RootState } from "@/store/store";

export default function DashboardLayout({ children }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { profile, token, isProfileLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const normalizedRole = (profile?.role ?? "CLIENT")
    .toString()
    .toUpperCase();
  const roleLabel = normalizedRole === "ADMIN" ? "Administrator" : "Client";
  const userLabel = profile?.username ?? "User";

  useEffect(() => {
    if (!token && !isProfileLoading) {
      router.replace("/login");
    }
  }, [token, isProfileLoading, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  if (!token && !isProfileLoading) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.left}>
          <OfflineBoltIcon sx={{ fontSize: 50, color: "#016DAB" }} />
          <div className={styles.textContainer}>
            <span className={styles.title}>Energy Management System</span>
            <span className={styles.regularText}>
              {roleLabel} Portal{profile ? ` • ${userLabel}` : ""}
            </span>
          </div>
        </div>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#ffffff",
            color: "#000000",
            border: "1px solid #dfdfdf",
            fontWeight: "500",
            borderRadius: "10px",
            textTransform: "none",
          }}
          startIcon={<OfflineBoltIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <div className={styles.contentContainer}>
        <ManagementSwitcher />
        {children}
      </div>
    </>
  );
}
