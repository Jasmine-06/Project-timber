"use client";

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Follower {
  _id: string
  username: string
  name: string
  profile_picture?: string
}

interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  followers: Follower[]
  isLoading?: boolean
}

export function FollowersDialog({ 
  open, 
  onOpenChange, 
  userId,
  followers = [],
  isLoading = false 
}: FollowersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const filteredFollowers = followers.filter(follower =>
    follower.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRemove = (followerId: string) => {
    // TODO: Implement remove follower API call
    console.log('Remove follower:', followerId)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-[500px] mx-4 bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
        {/* Header */}
        <div className="relative border-b border-border flex items-center justify-center py-2 px-4 flex-shrink-0">
          <h2 className="font-semibold text-base">Followers</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity p-1"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-2 py-2 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-lg bg-muted/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Followers List */}
        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-4">
              <p className="text-sm text-muted-foreground text-center">
                {searchQuery ? 'No followers found' : 'No followers yet'}
              </p>
            </div>
          ) : (
            <div>
              {filteredFollowers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-11 w-11 flex-shrink-0">
                      <AvatarImage src={follower.profile_picture} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                        {follower.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate">
                        {follower.username}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {follower.name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-semibold flex-shrink-0 h-8 px-4 hover:bg-muted/50 rounded-md"
                    onClick={() => handleRemove(follower._id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
