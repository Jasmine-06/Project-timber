import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <article className="w-full bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-0.5 w-0.5 rounded-full" />
            <Skeleton className="h-2.5 w-8" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Image */}
      <Skeleton className="w-full aspect-4/5 rounded-none" />

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>

        {/* Likes Count */}
        <Skeleton className="h-3.5 w-16 mb-2" />

        {/* Caption */}
        <div className="mb-1">
          <Skeleton className="h-3.5 w-[85%]" />
        </div>

        {/* Comments Count */}
        <Skeleton className="h-3.5 w-28" />
      </div>
    </article>
  )
}
