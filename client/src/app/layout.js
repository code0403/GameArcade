import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Game Arcade",
  description: "Multi-game arcade built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
