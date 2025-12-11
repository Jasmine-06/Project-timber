'use client'

import React, { useState } from 'react'
import { PostCard } from './_components/PostCard'
import { RightSidebar } from './_components/RightSidebar'
import InstagramPostDialog from './_components/PostDetailDialogue'
import { useGetPosts } from '@/hooks/use-get-posts'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'


export default function Page() {
  const { data: posts, isLoading, isError, error } = useGetPosts()
  const { user } = useAuthStore()
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCommentClick = (post: IPost) => {
    setSelectedPost(post)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex gap-8 justify-center">
      {/* Main Feed */}
      <div className="flex flex-col w-full md:max-w-[640px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500">Something went wrong. Please try again later.</p>
          </div>
        )}

        {!isLoading && !isError && posts?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        )}

        {!isLoading && !isError && posts && posts.length > 0 && (
          <>
            {posts.map((post) => {
              // user_id can be a string or populated IUser object
              const author = typeof post.user_id === 'string' ? null : post.user_id

              return (
                <PostCard
                  key={post._id}
                  postId={post._id}
                  username={author?.username || 'Unknown'}
                  userAvatar={author?.profile_picture}
                  timeAgo={formatTimeAgo(post.createdAt)}
                  caption={post.caption}
                  images={post.images || []}
                  likesCount={post.likes ?? 0}
                  commentsCount={post.comments ?? 0}
                  isLiked={post.isLiked || false}
                  isBookmarked={post.isBookmarked || false}
                  userComment={post.userComment}
                  onComment={() => handleCommentClick(post)}
                />
              )
            })}
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Post Detail Dialog */}
      {selectedPost && (
        <InstagramPostDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          post={selectedPost}
        />
      )}
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  const years = Math.floor(days / 365)
  return `${years}y`
}
