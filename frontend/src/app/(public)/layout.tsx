import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import { SiteHeader } from "./_components/SiteHeader";
import { MobileNav } from "./_components/MobileNav";
import { SuspendedAccountGuard } from "@/components/guards/SuspendedAccountGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SuspendedAccountGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col bg-background min-h-screen pb-14 md:pb-0">
            {children}
          </div>
          <MobileNav />
        </SidebarInset>
      </SidebarProvider>
    </SuspendedAccountGuard>
  );
}
