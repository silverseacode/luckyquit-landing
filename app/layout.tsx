import Header from "@/globals/Header";
import { SocketProvider } from "./Context/store";
import "./globals.css";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'],weight: ["500", "700"], variable:"--font-montserrat" })

export const metadata = {
  title: "Lucky Quit | Your Path to Quit Smoking Forever | Smoking Cessation App",
  description: "Discover top-notch smoking cessation coaches and take control of your journey to quit smoking. Our app empowers you to track your cigarette consumption, monitor your health progress, and visualize the money saved. Start your smoke-free life today!",
  keywords: ["quit smoking","Smoke-free app", "Nicotine addiction help", "Motivational support for quitting smoking","Quit smoking benefits"]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <html lang="en">
      {/* <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></meta> */}
        <body className={montserrat.variable}>{children}</body>
      </html>
    </SocketProvider>
  );
}
