import React from 'react'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Award, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface PostCardProps {
  subreddit: string
  subredditIcon?: string
  author: string
  timeAgo: string
  title: string
  content?: string
  image?: string
  votes: number
  comments: number
}

export function PostCard({
  subreddit,
  subredditIcon,
  author,
  timeAgo,
  title,
  content,
  image,
  votes,
  comments,
}: PostCardProps) {
  return (
    <div className="flex w-full bg-card text-card-foreground rounded-md border border-border hover:border-sidebar-border transition-all cursor-pointer overflow-hidden">
      {/* Vote Column */}
      <div className="flex flex-col items-center p-2 bg-muted/10 w-10 md:w-12 gap-1 pt-3">
        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:bg-transparent hover:text-orange-500 p-0">
          <ArrowBigUp className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        <span className="text-xs font-bold my-1">{votes}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:bg-transparent hover:text-blue-500 p-0">
          <ArrowBigDown className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {/* Content Column */}
      <div className="flex-1 pt-2 pb-1 pr-2">
        {/* Header */}
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground mb-2 flex-wrap">
          <Avatar className="h-5 w-5 md:h-6 md:w-6">
            <AvatarImage src={subredditIcon} />
            <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{subreddit[2].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-bold text-foreground hover:underline">{subreddit}</span>
          <span className="text-[10px]">•</span>
          <span className="hover:underline">Posted by u/{author}</span>
          <span>{timeAgo}</span>
          <Button variant="secondary" size="sm" className="h-5 text-xs rounded-full px-2 ml-auto md:ml-2">
            Join
          </Button>
        </div>

        {/* Title */}
        <h3 className="px-1 text-base md:text-lg font-medium leading-snug mb-2">{title}</h3>

        {/* Content/Image */}
        <div className="px-1 mb-2">
            {content && <p className="text-sm mb-3 line-clamp-3">{content}</p>}
            {image && (
                <div className="rounded-lg overflow-hidden border border-border bg-black/5 flex justify-center max-h-[500px]">
                    <img src={image} alt={title} className="w-full h-full object-contain" />
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2 hover:bg-muted h-8">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold">{comments} Comments</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2 hover:bg-muted h-8">
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-bold">Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2 hover:bg-muted h-8">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold">Award</span>
            </Button>
             <Button variant="ghost" size="sm" className="rounded-full px-2 hover:bg-muted h-8">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  )
}
