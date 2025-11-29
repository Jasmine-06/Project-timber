import { Toaster } from "sonner";
import ReactQueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
        <NuqsAdapter>
          {children}
          <Toaster/>
        </NuqsAdapter>
      </ReactQueryProvider>

    </ThemeProvider>
  );
}
