import { AdminGuard } from '@/components/guards/AdminGuard'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}
