import React from 'react'
import { User, Image, Link as LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function CreatePostBar() {
  return (
    <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-md mb-4">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <Input 
        placeholder="Create Post" 
        className="flex-1 bg-muted/50 border-none hover:bg-muted focus-visible:ring-0 focus-visible:bg-background transition-colors"
      />
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
        <Image className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
        <LinkIcon className="h-5 w-5" />
      </Button>
    </div>
  )
}
