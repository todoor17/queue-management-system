"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import UsersComponent from "@/components/UsersComponent/UsersComponent";
import type { RootState } from "@/store/store";

export default function DashboardUsers() {
  const router = useRouter();
  const { token, profile, isProfileLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const normalizedRole = (profile?.role ?? "CLIENT")
    .toString()
    .toUpperCase();

  useEffect(() => {
    if (!token && !isProfileLoading) {
      router.replace("/login");
      return;
    }
    if (
      token &&
      profile &&
      normalizedRole !== "ADMIN"
    ) {
      router.replace("/dashboard/devices");
    }
  }, [token, profile, normalizedRole, isProfileLoading, router]);

  if (!token && !isProfileLoading) {
    return null;
  }
  if (normalizedRole !== "ADMIN") {
    return null;
  }

  return <UsersComponent />;
}
