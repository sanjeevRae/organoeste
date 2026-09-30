import { isAdminCookie, ADMIN_COOKIE } from "@/lib/admin";
import { cookies } from "next/headers";
import { adminBootstrap } from "../../actions";
import PostPageClient from "../../post/PostPageClient";

export const metadata = { title: "Edit blog post | Organoeste" };

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await cookies();
  const authed = isAdminCookie(store.get(ADMIN_COOKIE)?.value);
  const state = await adminBootstrap();
  return <PostPageClient slug={decodeURIComponent(slug)} initial={state} authed={authed} />;
}
