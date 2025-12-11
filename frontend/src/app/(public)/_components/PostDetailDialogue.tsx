import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  X,
  Loader2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPostById } from "@/hooks/use-get-post-by-id";
import { useGetPostComments } from "@/hooks/use-get-post-comments";
import { useCreateCommentMutation, useDeleteCommentMutation, useUpdateCommentMutation } from "@/hooks/use-comment-mutations";
import { useAuthStore } from "@/store/auth-store";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { useToggleBookmark } from "@/hooks/use-toggle-bookmark";

interface InstagramPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const InstagramPostDialog = ({ open, onOpenChange, postId }: InstagramPostDialogProps) => {
  const { user } = useAuthStore();
  const { data: postData, isLoading: isPostLoading } = useGetPostById(postId);
  const { data: commentsData, isLoading: isCommentsLoading } = useGetPostComments(postId);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateCommentMutation();
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteCommentMutation();
  const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateCommentMutation();

  const toggleLikeMutation = useToggleLike();
  const toggleBookmarkMutation = useToggleBookmark();

  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const isLoading = isPostLoading || isCommentsLoading;
  const post = postData;

  const handleLike = () => {
    toggleLikeMutation.mutate({ post_id: postId });
  }

  const handleBookmark = () => {
    toggleBookmarkMutation.mutate({ post_id: postId });
  }

  const handlePostComment = () => {
    if (!comment.trim()) return;

    createComment({
      post_id: postId,
      content: comment
    }, {
      onSuccess: () => {
        setComment("");
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  }

  const startEditing = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  }

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  }

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return;

    updateComment({
      commentId,
      data: { content: editContent }
    }, {
      onSuccess: () => {
        cancelEditing();
      }
    });
  }



  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const getAuthor = (user: string | IUser) => {
    if (typeof user === 'object' && user !== null) {
      return {
        username: user.username,
        avatar: user.profile_picture
      }
    }
    return {
      username: 'Unknown',
      avatar: undefined
    }
  }

  const getCommentAuthor = (user: string | IUser) => {
    if (typeof user === 'object' && user !== null) {
      return {
        username: user.username,
        avatar: user.profile_picture
      }
    }
    return {
      username: 'Unknown',
      avatar: undefined
    }
  }

  if (isLoading || !post) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-50 flex items-center justify-center p-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      </div>
    )
  }

  const author = getAuthor(post.user_id);
  const imageUrl = post.images && post.images.length > 0 ? post.images[0] : undefined;
  const videoUrl = post.videos && post.videos.length > 0 ? post.videos[0] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />

      {/* Close button - moved outside for better visibility */}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 z-[60] text-white/90 hover:text-white hover:scale-110 transition-all duration-200 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
        aria-label="Close dialog"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-6xl h-[85vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-full">
          {/* Left side - Image/Video */}
          <div className="flex-[1.2] bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center min-w-0 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />

            {imageUrl || videoUrl ? (
              <div className="w-full h-full relative flex items-center justify-center p-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Post content"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-7xl mb-4 opacity-40">📷</div>
                  <p className="text-muted-foreground text-sm font-medium">No media available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Comments */}
          <div className="w-[420px] flex flex-col border-l border-border/50 bg-card/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-gradient-to-b from-background/50 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 ring-2 ring-border/30">
                  <AvatarImage src={author.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--instagram-pink))] to-orange-500 text-white text-sm font-semibold">
                    {author.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-foreground">{author.username}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded-full transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {/* Caption */}
              {post.caption && (
                <div className="flex gap-3 pb-4 border-b border-border/30">
                  <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-border/20">
                    <AvatarImage src={author.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--instagram-pink))] to-orange-500 text-white text-sm font-semibold">
                      {author.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-bold">{author.username}</span>{" "}
                      <span className="text-foreground/90">{post.caption}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {commentsData?.map((c: IComment) => {
                const commentAuthor = getCommentAuthor(c.user_id);
                const isMyComment = typeof c.user_id === 'object'
                  ? c.user_id._id === user?._id
                  : c.user_id === user?._id;
                const isEditing = editingCommentId === c._id;

                return (
                  <div key={c._id} className="flex gap-3 group hover:bg-secondary/20 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-border/10">
                      <AvatarImage src={commentAuthor.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-muted-foreground text-sm font-semibold">
                        {commentAuthor.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-sm text-foreground">{commentAuthor.username}</span>
                          <span className="text-xs text-muted-foreground font-medium">{formatTime(c.createdAt)}</span>
                        </div>

                        {isEditing ? (
                          <div className="flex flex-col gap-2 mt-1">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="h-9 text-sm border-border/50 focus-visible:ring-2 focus-visible:ring-[hsl(var(--instagram-blue))]/20"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleUpdateComment(c._id);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                            />
                            <div className="flex gap-3 text-xs">
                              <button
                                onClick={() => handleUpdateComment(c._id)}
                                disabled={isUpdatingComment}
                                className="font-bold text-[hsl(var(--instagram-blue))] hover:text-[hsl(var(--instagram-blue))]/80 disabled:opacity-50 transition-colors"
                              >
                                {isUpdatingComment ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="font-bold text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {c.content}
                          </p>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-xs text-muted-foreground font-bold hover:text-foreground transition-colors">
                            Reply
                          </button>
                          {isMyComment && (
                            <>
                              <button
                                onClick={() => startEditing(c._id, c.content)}
                                className="text-xs text-muted-foreground font-bold hover:text-foreground transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(c._id)}
                                disabled={isDeletingComment}
                                className="text-xs text-red-500 font-bold hover:text-red-600 disabled:opacity-50 transition-colors"
                              >
                                {isDeletingComment ? "Deleting..." : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            {/* Actions */}
            <div className="border-t border-border/50 px-5 py-4 space-y-3 bg-gradient-to-t from-background/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    onClick={handleLike}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <Heart
                      className={`w-7 h-7 transition-all ${post?.isLiked ? 'fill-[hsl(var(--instagram-red))] text-[hsl(var(--instagram-red))] scale-110' : 'text-foreground'}`}
                    />
                  </button>
                  <button className="hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="w-7 h-7 text-foreground" />
                  </button>
                </div>
                <button
                  onClick={handleBookmark}
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <Bookmark
                    className={`w-7 h-7 transition-all ${post?.isBookmarked ? 'fill-foreground scale-110' : ''} text-foreground`}
                  />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">{(post.likes || 0).toLocaleString()} likes</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{formatTime(post.createdAt)}</p>
              </div>
            </div>

            {/* Comment Input */}
            <div className="border-t border-border/50 px-5 py-4 flex items-center gap-3 bg-background/80">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (comment.trim()) {
                      handlePostComment();
                    }
                  }
                }}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/70 text-foreground px-0 font-medium"
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={!comment.trim() || isCreatingComment}
                onClick={handlePostComment}
                className="text-[hsl(var(--instagram-blue))] font-bold hover:text-[hsl(var(--instagram-blue))]/80 hover:bg-transparent disabled:opacity-50 transition-all px-3 py-2"
              >
                {isCreatingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramPostDialog;