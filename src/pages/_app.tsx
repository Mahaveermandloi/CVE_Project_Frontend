  import type { AppProps } from "next/app";
  import Navbar from "../components/Navbar";

  // Import Inter font
  import { Inter } from "@next/font/google";
  import "../styles/globals.css"; // make sure tailwind is included

  const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
  });

  export default function MyApp({ Component, pageProps }: AppProps) {
    return (
      <div className={inter.className}>
        <Navbar />
        <Component {...pageProps}  />
      </div>
    );
  }
