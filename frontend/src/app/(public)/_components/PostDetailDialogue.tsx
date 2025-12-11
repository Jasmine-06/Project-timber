import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  Smile,
  X
} from "lucide-react";

interface Comment {
  id: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

interface PostData {
  id: string;
  author: {
    username: string;
    avatar?: string;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface InstagramPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: PostData;
}

const InstagramPostDialog = ({ open, onOpenChange, post }: InstagramPostDialogProps) => {
  const [liked, setLiked] = useState(post?.isLiked || false);
  const [saved, setSaved] = useState(post?.isSaved || false);
  const [comment, setComment] = useState("");

  if (!post) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-[95vw] max-w-[1100px] h-[90vh] max-h-[600px] bg-background border border-border rounded-lg overflow-hidden shadow-2xl">
        <div className="flex h-full">
          {/* Left side - Image/Video */}
          <div className="flex-1 bg-black flex items-center justify-center min-w-0">
            {post.imageUrl || post.videoUrl ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                {post.videoUrl && (
                  <video 
                    src={post.videoUrl} 
                    controls 
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full relative bg-gradient-to-b from-muted/20 to-background flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-muted-foreground text-sm">No media</p>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Comments */}
          <div className="w-[400px] flex flex-col border-l border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--instagram-pink))] to-orange-500 text-foreground text-xs">
                    {post.author.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">{post.author.username}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Caption */}
              {post.content && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--instagram-pink))] to-orange-500 text-foreground text-xs">
                      {post.author.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">{post.author.username}</span>{" "}
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={c.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {c.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{c.username}</span>{" "}
                      {c.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{formatTime(c.createdAt)}</span>
                      {c.likes && c.likes > 0 && (
                        <span className="text-xs text-muted-foreground">{c.likes} like{c.likes > 1 ? 's' : ''}</span>
                      )}
                      <button className="text-xs text-muted-foreground font-semibold hover:text-foreground">
                        Reply
                      </button>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <Heart 
                      className={`w-6 h-6 ${liked ? 'fill-[hsl(var(--instagram-red))] text-[hsl(var(--instagram-red))]' : 'text-foreground'}`} 
                    />
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <MessageCircle className="w-6 h-6 text-foreground" />
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <Send className="w-6 h-6 text-foreground" />
                  </button>
                </div>
                <button 
                  onClick={() => setSaved(!saved)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Bookmark 
                    className={`w-6 h-6 ${saved ? 'fill-foreground' : ''} text-foreground`} 
                  />
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">{post.likes.toLocaleString()} likes</p>
                <p className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</p>
              </div>
            </div>

            {/* Comment Input */}
            <div className="border-t border-border p-4 flex items-center gap-3">
              <button className="hover:opacity-70 transition-opacity">
                <Smile className="w-6 h-6 text-foreground" />
              </button>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground text-foreground px-0"
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={!comment.trim()}
                className="text-[hsl(var(--instagram-blue))] font-semibold hover:text-[hsl(var(--instagram-blue))] hover:bg-transparent disabled:opacity-50"
              >
                Post
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute -top-10 right-0 text-white hover:opacity-70 transition-opacity z-50"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramPostDialog;
