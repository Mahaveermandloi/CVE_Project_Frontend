import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const current = router.pathname;

  return (
    <nav className="flex gap-5 p-4 bg-white ">
      <Link
        href="/dashboard"
        className={`text-lg pb-1 ${
          current === "/dashboard"
            ? "text-black border-b-2 border-black"
            : "text-gray-500"
        }`}
      >
        Home
      </Link>

      <Link
        href="/graph"
        className={`text-lg pb-1 ${
          current === "/graph"
            ? "text-black border-b-2 border-black"
            : "text-gray-500"
        }`}
      >
        Graph
      </Link>
    </nav>
  );
}
