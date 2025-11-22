import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const current = router.pathname;

  return (
    <nav className="flex gap-5 p-4 bg-[#01308b]  ">
      <Link
        href="/dashboard"
        className={` lg:text-lg pb-1 ${
          current === "/dashboard"
            ? "text-white border-b-2 font-bold "
            : "text-gray-500"
        }`}
      >
        Home
      </Link>

      <Link
        href="/graph"
        className={`lg:text-lg pb-1 ${
          current === "/graph"
            ? "text-white border-b-2 "
            : "text-gray-500"
        }`}
      >
        Graph
      </Link>
    </nav>
  );
}
