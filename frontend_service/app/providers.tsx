"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, type AppDispatch, type RootState } from "@/store/store";
import { fetchCurrentUser } from "@/store/auth/auth-thunks";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, profile, isProfileLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const lastFetchedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (token && !profile && !isProfileLoading) {
      if (lastFetchedTokenRef.current === token) {
        return;
      }
      lastFetchedTokenRef.current = token;
      dispatch(fetchCurrentUser());
    } else if (!token) {
      lastFetchedTokenRef.current = null;
    }
  }, [dispatch, token, profile, isProfileLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
}
