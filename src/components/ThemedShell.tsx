"use client";

import { useTheme } from "@/lib/theme";
import ConfluenceShell from "./ConfluenceShell";
import PostmanShell from "./PostmanShell";

export default function ThemedShell(props: {
  breadcrumb?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const Shell = theme === "postman" ? PostmanShell : ConfluenceShell;
  return <Shell {...props} />;
}
