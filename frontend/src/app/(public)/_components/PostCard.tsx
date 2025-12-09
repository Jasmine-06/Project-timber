'use client'
import React, { useState, useEffect } from 'react'
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
  const [liked, setLiked] = useState(isLiked)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [likes, setLikes] = useState(likesCount)

  // Sync local state with props when they change (e.g., from cache updates)
  useEffect(() => {
    setLiked(isLiked)
  }, [isLiked])

  useEffect(() => {
    setBookmarked(isBookmarked)
  }, [isBookmarked])

  useEffect(() => {
    setLikes(likesCount)
  }, [likesCount])

  // TanStack Query mutations
  const toggleLikeMutation = useToggleLike()
  const toggleBookmarkMutation = useToggleBookmark()

  const handleLike = () => {
    // Optimistic update
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikes(newLikedState ? likes + 1 : likes - 1)

    // Call API
    toggleLikeMutation.mutate(
      { post_id: postId },
      {
        onError: () => {
          // Revert on error
          setLiked(!newLikedState)
          setLikes(newLikedState ? likes - 1 : likes + 1)
        }
      }
    )

    onLike?.()
  }

  const handleBookmark = () => {
    // Optimistic update
    const newBookmarkedState = !bookmarked
    setBookmarked(newBookmarkedState)

    // Call API
    toggleBookmarkMutation.mutate(
      { post_id: postId },
      {
        onError: () => {
          // Revert on error
          setBookmarked(!newBookmarkedState)
        }
      }
    )

    onBookmark?.()
  }

  return (
    <article className="w-full bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
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
        <div className="w-full bg-muted/20 max-h-[600px] overflow-hidden flex items-center justify-center">
          <img 
            src={images[0]} 
            alt={`Post by ${username}`}
            className="w-[90%] h-full max-h-[600px] object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 hover:bg-transparent p-0"
              onClick={handleLike}
            >
              <Heart 
                className={`h-[28px] w-[28px] transition-colors ${
                  liked ? 'fill-red-500 text-red-500' : 'text-foreground'
                }`}
              />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 hover:bg-transparent p-0"
              onClick={onComment}
            >
              <MessageCircle className="h-[28px] w-[28px]" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 hover:bg-transparent p-0"
            onClick={handleBookmark}
          >
            <Bookmark 
              className={`h-[28px] w-[28px] transition-colors ${
                bookmarked ? 'fill-foreground text-foreground' : 'text-foreground'
              }`}
            />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="mb-1.5">
          <span className="text-sm font-semibold">{likes.toLocaleString()} likes</span>
        </div>

        {/* Caption */}
        {caption && (
          <div className="text-sm mb-1">
            <span className="font-semibold mr-1.5">{username}</span>
            <span className="whitespace-pre-wrap">{caption}</span>
          </div>
        )}

        {/* User's Comment */}
        {userComment && (
          <div className="text-sm mb-1.5 bg-muted/30 rounded-md px-2 py-1.5">
            <span className="font-semibold mr-1.5 text-primary">You</span>
            <span className="whitespace-pre-wrap">{userComment.content}</span>
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
