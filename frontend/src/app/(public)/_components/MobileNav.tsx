import React from 'react'
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-border flex items-center justify-around px-2 z-50">
      <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <Home className="h-6 w-6" />
      </Link>
      <Link href="/explore" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <Compass className="h-6 w-6" />
      </Link>
      <div className="flex flex-col items-center justify-center w-full h-full">
         <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-sm">
            <Plus className="h-6 w-6" />
         </Button>
      </div>
      <Link href="/chat" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <MessageCircle className="h-6 w-6" />
      </Link>
      <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <User className="h-6 w-6" />
      </Link>
    </div>
  )
}
