import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <article className="w-full bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-[18px] w-32" />
            <Skeleton className="h-1 w-1 rounded-full" />
            <Skeleton className="h-[14px] w-14" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>

      {/* Image */}
      <Skeleton className="w-full aspect-[10/9] rounded-none" />

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>

        {/* Likes Count */}
        <Skeleton className="h-[14px] w-20 mb-1.5" />

        {/* Caption */}
        <div className="mb-1">
          <Skeleton className="h-4 w-[85%]" />
        </div>

        {/* Comments Count */}
        <Skeleton className="h-[14px] w-40" />
      </div>
    </article>
  )
}
