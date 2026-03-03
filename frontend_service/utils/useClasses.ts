"use client";

import { SxProps, Theme, useTheme } from "@mui/material/styles";
import { useMemo } from "react";

export default function useClasses<
  T extends Record<string, SxProps<Theme> | ((theme: Theme) => SxProps<Theme>)>
>(styles: T) {
  const theme = useTheme();

  return useMemo(() => {
    const resolved: any = {};
    for (const key in styles) {
      const style = styles[key];
      resolved[key] = typeof style === "function" ? style(theme) : style;
    }
    return resolved as Record<keyof T, SxProps<Theme>>;
  }, [styles, theme]);
}
