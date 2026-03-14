"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position="bottom-left"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#000000',
          border: '1px solid #E5E5E5',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#000000",
          "--normal-border": "#E5E5E5",
          "--success-bg": "#FFFFFF",
          "--success-text": "#000000",
          "--success-border": "#10B981",
          "--error-bg": "#FFFFFF",
          "--error-text": "#000000",
          "--error-border": "#EF4444",
          "--info-bg": "#FFFFFF",
          "--info-text": "#000000",
          "--info-border": "#3B82F6",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };