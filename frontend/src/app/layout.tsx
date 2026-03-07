import "../globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="dark">
      <body className="font-inter bg-background text-textPrimary">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
