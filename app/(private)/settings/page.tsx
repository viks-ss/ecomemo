import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  return <SettingsContent email={session?.user?.email ?? ""} />;
}
