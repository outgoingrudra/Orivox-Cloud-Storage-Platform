import "./globals.css";
import AppProviders from "@/providers/AppProviders";

export const metadata = {
  title: "Orivox",
  description: "Secure cloud storage platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}