import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // redirect to /dashboard
  }, [router]);

  return null; // no content while redirecting
}
