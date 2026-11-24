"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const WIDGET_SRC =
  "https://test.onewaynepal.com/chat-api/widget.js?org=29febdf0-34b4-402a-95ec-70f4cb4e5810";
const SCRIPT_ID = "onewaynepal-chat-widget";

/**
 * Internal / non-public areas that must never show the chat widget.
 * "/admin" covers the blog dashboard, the post editor and the admin
 * login form — the login lives on /admin itself; this site has no
 * separate /login route. "/preview-contact" is an internal preview page.
 */
const EXCLUDED_PREFIXES = ["/admin", "/preview-contact"];

function removeWidget() {
  document.getElementById(SCRIPT_ID)?.remove();
  document.querySelectorAll('[id^="onewaybot"]').forEach((el) => el.remove());
  // The widget also injects a <style> element full of onewaybot rules.
  document.querySelectorAll("style").forEach((el) => {
    if (el.textContent?.includes("onewaybot")) el.remove();
  });
}

/**
 * Loads the OneWay Nepal chat widget on public pages only.
 * Rendered from the root layout; on excluded routes it injects nothing,
 * and if the visitor navigates from a public page into an excluded area
 * it strips the script and every DOM node the widget created.
 */
export default function ChatWidget() {
  const pathname = usePathname();

  useEffect(() => {
    const excluded = EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
    );
    if (excluded) {
      removeWidget();
      return;
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = WIDGET_SRC;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [pathname]);

  return null;
}
