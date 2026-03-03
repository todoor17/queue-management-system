"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import SupportCenter from "@/components/SupportCenter/SupportCenter";
import type { RootState } from "@/store/store";

export default function DashboardSupport() {
  const router = useRouter();
  const { token, isProfileLoading } = useSelector(
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

  return <SupportCenter />;
}
