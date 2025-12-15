'use client'
import React from 'react'
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToggleLike } from '@/hooks/use-toggle-like'
import { useToggleBookmark } from '@/hooks/use-toggle-bookmark'

interface PostCardProps {
  postId: string
  username: string
  userAvatar?: string
  timeAgo: string
  caption?: string
  images?: string[]
  likesCount: number
  commentsCount: number
  isLiked?: boolean
  isBookmarked?: boolean
  userComment?: IComment | null
  onLike?: () => void
  onComment?: () => void
  onBookmark?: () => void
}

export function PostCard({
  postId,
  username,
  userAvatar,
  timeAgo,
  caption,
  images = [],
  likesCount,
  commentsCount,
  isLiked = false,
  isBookmarked = false,
  userComment,
  onLike,
  onComment,
  onBookmark,
}: PostCardProps) {
  // TanStack Query mutations
  const toggleLikeMutation = useToggleLike()
  const toggleBookmarkMutation = useToggleBookmark()

  const handleLike = () => {
    // Call API - optimistic update is handled by the mutation hook
    toggleLikeMutation.mutate({ post_id: postId });
    onLike?.();
  }

  const handleBookmark = () => {
    // Call API - optimistic update is handled by the mutation hook
    toggleBookmarkMutation.mutate({ post_id: postId });
    onBookmark?.();
  }

  return (
    <article className="w-full bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold hover:opacity-70 cursor-pointer">
              {username}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">{timeAgo}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Image */}
      {images.length > 0 && (
        <div className="w-full aspect-square overflow-hidden bg-black dark:bg-black">
          <img
            src={images[0]}
            alt={`Post by ${username}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-transparent p-0"
              onClick={handleLike}
            >
              <Heart
                className={`w-8 h-8 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                  }`}
                strokeWidth={1.2}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-transparent p-0"
              onClick={onComment}
            >
              <MessageCircle className="w-8 h-8" strokeWidth={1.2} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 hover:bg-transparent p-0"
            onClick={handleBookmark}
          >
            <Bookmark
              className={`w-8 h-8 transition-colors ${isBookmarked ? 'fill-foreground text-foreground' : 'text-foreground'
                }`}
              strokeWidth={1.2}
            />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="mb-1.5">
          <span className="text-sm font-semibold">{likesCount.toLocaleString()} likes</span>
        </div>

        {/* Caption */}
        {caption && (
          <div className="text-sm mb-1">
            <span className="font-semibold mr-1.5">{username}</span>
            <span className="whitespace-pre-wrap">{caption}</span>
          </div>
        )}



        {/* Comments Count */}
        {commentsCount > 0 && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={onComment}
          >
            View all {commentsCount} comments
          </button>
        )}
      </div>
    </article>
  )
}
