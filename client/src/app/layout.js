import "./globals.css";


export const metadata = {
  title: "Game Arcade",
  description: "Multi-game arcade built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
