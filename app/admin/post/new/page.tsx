import { isAdminCookie, ADMIN_COOKIE } from "@/lib/admin";
import { cookies } from "next/headers";
import { adminBootstrap } from "../../actions";
import PostPageClient from "../../post/PostPageClient";

export const metadata = { title: "New blog post | Organoeste" };

export default async function NewPostPage() {
  const store = await cookies();
  const authed = isAdminCookie(store.get(ADMIN_COOKIE)?.value);
  const state = await adminBootstrap();
  return <PostPageClient slug={null} initial={state} authed={authed} />;
}
