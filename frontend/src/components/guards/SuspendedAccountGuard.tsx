'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuspendedAccountGuardProps {
  children: React.ReactNode
}

export function SuspendedAccountGuard({ children }: SuspendedAccountGuardProps) {
  const { user, isLoading, setLogout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If no user, show nothing (will redirect)
  if (!user) {
    return null
  }

  // Check if account is suspended or deleted
  const isSuspended = user.account_status === 'suspended'
  const isDeleted = user.account_status === 'deleted'

  const handleLogout = () => {
    setLogout()
    router.push('/login')
  }

  // If account is suspended, show restriction message
  if (isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <ShieldOff className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
          <p className="text-muted-foreground mb-6">
            Your account has been suspended. You currently do not have access to Timber.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            If you believe this is a mistake or would like to appeal this decision, please contact our support team for assistance.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLogout}
              variant="default"
              className="w-full"
            >
              Log Out
            </Button>
            <a
              href="mailto:support@timber.com"
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    )
  }

  // If account is deleted, show deletion message
  if (isDeleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <ShieldOff className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Deleted</h1>
          <p className="text-muted-foreground mb-6">
            This account has been deleted and can no longer access Timber.
          </p>
          <Button
            onClick={handleLogout}
            variant="default"
            className="w-full"
          >
            Log Out
          </Button>
        </div>
      </div>
    )
  }

  // Account is active, render children
  return <>{children}</>
}
