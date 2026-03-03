"use client";

import MemoryIcon from "@mui/icons-material/Memory";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import type { CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function ManagementSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const authProfile = useSelector((state: RootState) => state.auth.profile);
  const normalizedRole = (authProfile?.role ?? "CLIENT")
    .toString()
    .toUpperCase();
  const isAdmin = normalizedRole === "ADMIN";

  const currentValue: "user" | "device" | "support" =
    pathname && pathname.includes("/support")
      ? "support"
      : pathname && pathname.includes("/devices")
      ? "device"
      : "user";
  const resolvedValue =
    !isAdmin && currentValue === "user" ? "device" : currentValue;

  const containerStyle: CSSProperties = {
    width: "fit-content",
    display: "inline-flex",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderRadius: "40px",
    padding: "4px",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  };

  const getButtonStyle = (isActive: boolean): CSSProperties => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "40px",
    border: "none",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: isActive ? "#ffffff" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    boxShadow: isActive
      ? "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)"
      : "none",
    transform: isActive ? "scale(1.02)" : "scale(1)",
  });

  const iconStyle = (isActive: boolean): CSSProperties => ({
    transition: "all 0.3s ease",
    strokeWidth: isActive ? 2.5 : 2,
  });

  return (
    <div style={containerStyle}>
      {isAdmin ? (
        <button
          onClick={() => {
            router.replace("/dashboard/users");
          }}
          style={getButtonStyle(resolvedValue === "user")}
        >
          <PersonIcon
            sx={{ fontSize: 16 }}
            style={iconStyle(resolvedValue === "user")}
          />
          <span>User Management</span>
        </button>
      ) : null}

      <button
        onClick={() => {
          router.replace("/dashboard/devices");
        }}
        style={getButtonStyle(resolvedValue === "device")}
      >
        <MemoryIcon
          sx={{ fontSize: 16 }}
          style={iconStyle(resolvedValue === "device")}
        />
        <span>Device Management</span>
      </button>

      <button
        onClick={() => {
          router.replace("/dashboard/support");
        }}
        style={getButtonStyle(resolvedValue === "support")}
      >
        <SupportAgentIcon
          sx={{ fontSize: 16 }}
          style={iconStyle(resolvedValue === "support")}
        />
        <span>Support</span>
      </button>
    </div>
  );
}
