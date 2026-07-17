import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ session }) => {
        if (!session) return router.replace("/login");
        if (session.role === "admin") return router.replace("/admin");
        router.replace("/rapor");
      });
  }, [router]);
  return null;
}
