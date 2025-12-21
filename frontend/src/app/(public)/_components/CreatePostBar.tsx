import React, { useState } from 'react'
import { User, Image, Link as LinkIcon, Loader2, SendHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCreatePost } from '@/hooks/use-create-post'
import { cn } from '@/lib/utils'

export function CreatePostBar() {
  const [caption, setCaption] = useState('')
  const { mutate: createPost, isPending } = useCreatePost()

  const handleCreatePost = () => {
    if (!caption.trim()) return

    createPost(
      { caption },
      {
        onSuccess: () => {
          setCaption('')
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreatePost()
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-card border border-border/50 rounded-xl mb-6 shadow-sm">
      <Avatar className="h-10 w-10 ring-2 ring-background transition-transform hover:scale-105 duration-200">
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 relative group">
        <Input
          placeholder="What's happening?"
          className="w-full bg-muted/30 border-none hover:bg-muted/50 focus-visible:ring-0 focus-visible:bg-muted/50 transition-all h-10 px-4 rounded-full pr-10"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!caption.trim() && (
          <>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors" disabled={isPending}>
              <Image className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors" disabled={isPending}>
              <LinkIcon className="h-5 w-5" />
            </Button>
          </>
        )}
        {caption.trim() && (
          <Button
            size="icon"
            className={cn("h-10 w-10 rounded-full transition-all duration-300", isPending ? "opacity-80" : "hover:scale-105")}
            onClick={handleCreatePost}
            disabled={isPending}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
