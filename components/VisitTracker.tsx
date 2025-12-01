"use client";

import { useEffect } from "react";

const VisitTracker = ({ slug = "home" }: { slug?: string }) => {
  useEffect(() => {
    // ✅ refresh / back-forward এ বারবার count না বাড়াতে sessionStorage guard
    const key = `visited_${slug}_session`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    // ✅ page open হলেই count +1
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null; // UI কিছু দেখাবে না
};

export default VisitTracker;
