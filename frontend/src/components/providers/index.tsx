
import ReactQueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import AuthProvider from "./auth-provider";
import { Toaster } from "../ui/sonner";

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
        <NuqsAdapter>
          {children}
          <Toaster/>
        </NuqsAdapter>
       </AuthProvider>
      </ReactQueryProvider>

    </ThemeProvider>
  );
}
