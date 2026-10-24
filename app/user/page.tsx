import type { Metadata } from "next";
import ProfilePanel from "@/components/ProfilePanel";

export const metadata: Metadata = { title: "Your profile" };

export default function UserPage() {
  return <ProfilePanel />;
}
