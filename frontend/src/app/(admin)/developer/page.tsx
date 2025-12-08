"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionCards } from "@/app/(admin)/developer/section-cards"
import { DataTable } from "@/app/(admin)/developer/data-table"
import { useGetUsers } from "@/app/(admin)/developer/use-get-users"

export default function DeveloperPage() {
  const { data: userData, isLoading } = useGetUsers({
    limit: 100,
    page: 1, // Get enough users for stats, though ideally stats should come from a separate endpoint
  });

  const users = userData?.data || [];

  const totalUsers = userData?.pagination?.totalUser || 0;

  // Calculate stats from loaded users (approximation if not fetching all)
  const activeUsers = users.filter(u => u.account_status === 'active').length;
  const suspendedUsers = users.filter(u => u.account_status === 'suspended').length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-right">Admin Dashboard</h1>
      </div>

      <SectionCards
        totalUsers={totalUsers}
        newUsers={newUsers}
        activeUsers={activeUsers}
        suspendedUsers={suspendedUsers}
      />

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold leading-none tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your application users.
          </p>
        </div>
        <div className="p-0">
          <DataTable data={users} />
        </div>
      </div>
    </div>
  )
}
