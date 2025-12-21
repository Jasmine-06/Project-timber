"use client";

import React, { useState } from 'react'
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { CreatePostDialog } from './CreatePostDialog'

export function MobileNav() {
  const { user } = useAuthStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Determine profile link - generic if not logged in, specific if logged in
  const profileLink = user?.username ? `/u/${user.username}` : '/login'

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-50 pb-2">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground active:text-foreground">
          <Home className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        <Link href="/communities" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground active:text-foreground">
          <Compass className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        
        <div className="flex flex-col items-center justify-center w-full h-full -mt-4">
           <Button 
            size="icon" 
            className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            onClick={() => setIsCreateOpen(true)}
          >
              <Plus className="h-6 w-6" strokeWidth={3} />
           </Button>
        </div>
        
        <Link href="/communities/my" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground active:text-foreground">
          <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        <Link href={profileLink} className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground active:text-foreground">
          <User className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      </div>

      <CreatePostDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </>
  )
}
