import React from 'react'
import { Search, Bell, MessageCircle, Plus, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="flex items-center gap-2 font-bold text-xl md:hidden">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
                <MessageCircle className="size-5" />
            </div>
            <span>ChatCom</span>
         </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ChatCom"
              className="w-full bg-muted/50 pl-9 rounded-full focus-visible:ring-0 focus-visible:bg-background transition-colors"
            />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
            <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground">
            <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
        </Button>
        <div className="ml-2">
             <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                <User className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </header>
  )
}
