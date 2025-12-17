
import ReactQueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import AuthProvider from "./auth-provider";
import { Toaster } from "../ui/sonner";
import { SocketProvider } from "@/context/socket-context";

export default function GlobalProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>
        <AuthProvider>
          <SocketProvider>
            <NuqsAdapter>
              {children}
              <Toaster />
            </NuqsAdapter>
          </SocketProvider>
        </AuthProvider>
      </ReactQueryProvider>

    </ThemeProvider>
  );
}
