'use client'

import { useState } from 'react'
import { PostCard } from './_components/PostCard'
import RightSidebar from './_components/RightSidebar'
import InstagramPostDialog from './_components/PostDetailDialogue'
import { useGetPosts } from '@/hooks/use-get-posts'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'


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
    <div className="flex gap-16 justify-center max-w-7xl mx-auto px-4">
      {/* Main Feed */}
      <div className="flex flex-col w-full max-w-2xl">
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
              const isAuthor = typeof post.user_id === 'string' ? post.user_id === user?._id : post.user_id._id === user?._id

              return (
                <PostCard
                  key={post._id}
                  postId={post._id}
                  username={author?.username || 'Unknown'}
                  userAvatar={author?.profile_picture}
                  timeAgo={formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
                  caption={post.caption}
                  images={post.images || []}
                  likesCount={post.likes ?? 0}
                  commentsCount={post.comments ?? 0}
                  isLiked={post.isLiked || false}
                  isBookmarked={post.isBookmarked || false}
                  isAuthor={isAuthor}
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
