'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
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
  isAuthor?: boolean
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
  isAuthor = false,
  userComment,
  onLike,
  onComment,
  onBookmark,
}: PostCardProps) {
  // TanStack Query mutations
  const toggleLikeMutation = useToggleLike()
  const toggleBookmarkMutation = useToggleBookmark()
  const router = useRouter()

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/u/${username}`);
  }

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
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div onClick={handleProfileClick} className="cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                {username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={handleProfileClick}
              className="text-[13px] font-semibold hover:underline cursor-pointer"
            >
              {username}
            </span>
            <span className="text-muted-foreground text-[10px]">•</span>
            <span className="text-muted-foreground text-[11px] font-medium">{timeAgo}</span>
          </div>
        </div>
        {isAuthor && (
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Image */}
      {images.length > 0 && (
        <div className="w-full aspect-4/5  overflow-hidden bg-black dark:bg-black rounded-sm border border-border/40">
          <img
            src={images[0]}
            alt={`Post by ${username}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-8! w-8! hover:bg-transparent p-0"
              onClick={handleLike}
            >
              <Heart
                className={`w-5! h-5! transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                  }`}
                strokeWidth={1.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="h-8! w-8! hover:bg-transparent p-0"
              onClick={onComment}
            >
              <MessageCircle className="w-5! h-5!" strokeWidth={1.5} />
            </Button>
          </div>
          <Button
            variant="ghost"
            className="h-8! w-8! hover:bg-transparent p-0"
            onClick={handleBookmark}
          >
            <Bookmark
              className={`w-5! h-5! transition-colors ${isBookmarked ? 'fill-foreground text-foreground' : 'text-foreground'
                }`}
              strokeWidth={1.5}
            />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="mb-1.5">
          <span className="text-[13px] font-semibold">{likesCount.toLocaleString()} likes</span>
        </div>

        {/* Caption */}
        {caption && (
          <div className="text-[13px] mb-1">
            <span className="font-semibold mr-1.5">{username}</span>
            <span className="whitespace-pre-wrap">{caption}</span>
          </div>
        )}



        {/* Comments Count */}
        {commentsCount > 0 && (
          <button
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={onComment}
          >
            View all {commentsCount} comments
          </button>
        )}
      </div>
    </article>
  )
}
