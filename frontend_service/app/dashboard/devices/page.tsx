"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import DeviceComponent from "@/components/DeviceComponent/DeviceComponent";
import type { RootState } from "@/store/store";

export default function DashboardDevices() {
  const router = useRouter();
  const { token, profile, isProfileLoading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!token && !isProfileLoading) {
      router.replace("/login");
    }
  }, [token, isProfileLoading, router]);

  if (!token && !isProfileLoading) {
    return null;
  }

  return <DeviceComponent />;
}
