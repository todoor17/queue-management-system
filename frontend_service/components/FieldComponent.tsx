import { FormControl, FormLabel, InputBase } from "@mui/material";
import type React from "react";

interface FieldComponentProps {
  type?: string;
  label?: string;
  placeholder?: string;
  name?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FieldComponent({
  type,
  label,
  placeholder,
  name,
  value,
  onChange,
}: FieldComponentProps) {
  const controlledProps: any = {};
  if (name) controlledProps.name = name;
  if (value !== undefined) controlledProps.value = value;
  if (onChange) controlledProps.onChange = onChange;
  return (
    <FormControl fullWidth sx={{ marginTop: "20px" }}>
      <FormLabel
        sx={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "0.8rem",
          color: "#111827",
          marginBottom: "3px",

          "&.Mui-focused": {
            color: "#000000",
          },
        }}
      >
        {label}
      </FormLabel>

      <InputBase
        type={type}
        placeholder={placeholder}
        {...controlledProps}
        sx={{
          backgroundColor: "#f3f3f5",
          borderRadius: "10px",
          height: "36px",
          padding: "0 12px",
          fontSize: "14px",
          border: "1px solid transparent",
          transition: "all 0.15s ease",
          "&::placeholder": {
            color: "#9ca3af",
          },
          "&:hover": {
            borderColor: "#9ca3af",
          },
          "&:focus-within": {
            borderColor: "#9ca3af",
            borderWidth: "2px",
          },
        }}
      />
    </FormControl>
  );
}
