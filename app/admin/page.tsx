import { isAdminCookie, ADMIN_COOKIE } from "@/lib/admin";
import { cookies } from "next/headers";
import { adminBootstrap } from "./actions";
import AdminClient from "./AdminClient";

export const metadata = { title: "Admin do blog | Organoeste" };

export default async function AdminPage() {
  const store = await cookies();
  const authed = isAdminCookie(store.get(ADMIN_COOKIE)?.value);
  const state = await adminBootstrap();
  return (
    <>
      <AdminClient authed={authed} initial={state} />
    </>
  );
}
