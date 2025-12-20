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
  Loader2,
  Trash2,
  Edit2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetPostComments } from "@/hooks/use-get-post-comments";
import { useCreateCommentMutation, useDeleteCommentMutation, useUpdateCommentMutation } from "@/hooks/use-comment-mutations";
import { useDeletePostMutation, useUpdatePostMutation } from "@/hooks/use-post-mutations";
import { useAuthStore } from "@/store/auth-store";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { useToggleBookmark } from "@/hooks/use-toggle-bookmark";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

interface InstagramPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: IPost;
}

const InstagramPostDialog = ({ open, onOpenChange, post }: InstagramPostDialogProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Get live post data from query cache for two-way communication
  const cachedPosts = queryClient.getQueryData<IPost[]>(['posts']);
  const livePost = cachedPosts?.find(p => p._id === post._id) || post;

  const { data: commentsData, isLoading: isCommentsLoading } = useGetPostComments(post._id);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateCommentMutation();
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteCommentMutation();
  const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateCommentMutation();
  const { mutate: toggleLike } = useToggleLike();
  const { mutate: toggleBookmark } = useToggleBookmark();
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePostMutation();
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePostMutation();

  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Post editing state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postCaption, setPostCaption] = useState(post.caption || "");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const isAuthor = typeof post.user_id === 'string' ? post.user_id === user?._id : post.user_id._id === user?._id;

  const handlePostComment = () => {
    if (!comment.trim()) return;

    createComment({
      post_id: post._id,
      content: comment
    }, {
      onSuccess: () => {
        setComment("");
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  const startEditing = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

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
  };

  const handleDeletePost = () => {
    deletePost(post._id, {
      onSuccess: () => {
        setIsDeleteAlertOpen(false);
        onOpenChange(false);
      }
    });
  };

  const handleUpdatePost = () => {
    // Assuming existing images are kept, only caption is updated for now
    // Since the API requires array of strings for images
    updatePost({
      postId: post._id,
      data: {
        caption: postCaption,
        images: post.images || [] // Keep existing images
      }
    }, {
      onSuccess: () => {
        setIsEditingPost(false);
      }
    });
  };





  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setPostCaption(post.caption || ""); // Reset caption on open
    } else {
      document.body.style.overflow = 'unset';
      setIsEditingPost(false); // Reset edit mode on close
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, post.caption]);

  if (!open) return null;

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
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
  };

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
  };



  if (!open) return null;

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
      <div className="relative z-50 w-full max-w-5xl h-[80vh] bg-background border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-full">
          {/* Left side - Image/Video */}
          <div className="flex-1 bg-black dark:bg-black min-w-0 relative overflow-hidden">
            {imageUrl || videoUrl ? (
              <div className="w-full h-full relative">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Post content"
                    className="w-full h-full object-cover"
                  />
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-black dark:bg-black">
                <div className="text-center p-8">
                  <div className="text-7xl mb-4 opacity-40">📷</div>
                  <p className="text-white/60 text-sm font-medium">No media available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Comments */}
          <div className="w-[350px] flex flex-col border-l border-border bg-background dark:bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background dark:bg-background">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={author.avatar} />
                  <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                    {author.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">{author.username}</span>
              </div>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-muted/50">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditingPost(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Caption
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-600 focus:text-red-600"
                      onClick={() => setIsDeleteAlertOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto px-4 py-0 space-y-0 bg-background dark:bg-background">
              {/* Caption */}
              {post.caption && (
                <div className="flex gap-3 py-3 border-b border-border/50">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={author.avatar} />
                    <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                      {author.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">{author.username}</span>{" "}
                      {isEditingPost ? (
                        <div className="mt-1 flex flex-col gap-2">
                          <Input
                            value={postCaption}
                            onChange={(e) => setPostCaption(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2 text-xs">
                            <button
                              onClick={handleUpdatePost}
                              disabled={isUpdatingPost}
                              className="font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
                            >
                              {isUpdatingPost ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingPost(false);
                                setPostCaption(post.caption || "");
                              }}
                              className="font-semibold text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-foreground">{post.caption}</span>
                      )}
                    </div>
                    {!isEditingPost && <p className="text-xs text-muted-foreground mt-1">{formatTime(post.createdAt)}</p>}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="py-2">
                {isCommentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 py-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  commentsData?.map((c: IComment) => {
                    const commentAuthor = getCommentAuthor(c.user_id);
                    const isMyComment = typeof c.user_id === 'object'
                      ? c.user_id._id === user?._id
                      : c.user_id === user?._id;
                    const isEditing = editingCommentId === c._id;

                    return (
                      <div key={c._id} className="flex gap-3 py-2 group">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={commentAuthor.avatar} />
                          <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                            {commentAuthor.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="h-8 text-sm"
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
                                  className="font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
                                >
                                  {isUpdatingComment ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="font-semibold text-muted-foreground hover:text-foreground"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed">
                                <span className="font-semibold">{commentAuthor.username}</span>{" "}
                                <span className="text-foreground">{c.content}</span>
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-muted-foreground">{formatTime(c.createdAt)}</span>
                                <button className="text-xs text-muted-foreground font-semibold hover:text-foreground">
                                  Reply
                                </button>
                                {isMyComment && (
                                  <>
                                    <button
                                      onClick={() => startEditing(c._id, c.content)}
                                      className="text-xs text-muted-foreground font-semibold hover:text-foreground"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(c._id)}
                                      disabled={isDeletingComment}
                                      className="text-xs text-red-500 font-semibold hover:text-red-600 disabled:opacity-50"
                                    >
                                      {isDeletingComment ? "Deleting..." : "Delete"}
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Footer Actions & Input */}
            <div className="border-t border-border mt-auto bg-background dark:bg-background">
              {/* Actions */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike({ post_id: post._id })}
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <Heart
                        className={`w-6 h-6 transition-all ${livePost.isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'}`}
                        strokeWidth={1.2}
                      />
                    </button>
                    <button className="hover:scale-110 transition-transform duration-200">
                      <MessageCircle className="w-6 h-6 text-foreground" strokeWidth={1.2} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark({ post_id: post._id })}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <Bookmark
                      className={`w-6 h-6 transition-all ${livePost.isBookmarked ? 'fill-foreground' : ''} text-foreground`}
                      strokeWidth={1.2}
                    />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{(post.likes || 0).toLocaleString()} likes</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{formatTime(post.createdAt)}</p>
                </div>
              </div>

              {/* Comment Input */}
              <div className="border-t border-border px-4 py-3 flex items-center gap-3 bg-background dark:bg-background">
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
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground px-0 h-auto py-2 text-foreground"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!comment.trim() || isCreatingComment}
                  onClick={handlePostComment}
                  className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300 hover:bg-transparent disabled:opacity-50 px-0 h-auto"
                >
                  {isCreatingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingPost}
            >
              {isDeletingPost ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InstagramPostDialog;