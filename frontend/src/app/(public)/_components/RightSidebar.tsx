'use client';

import React from 'react';
import { useGetCommunities } from '@/hooks/use-get-communities';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function RightSidebar() {
  const { data, isLoading } = useGetCommunities(1, 5);

  const formatMemberCount = (count?: number) => {
    if (!count) return '0';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(count);
  };

  return (
    <div className="hidden xl:block w-[300px] shrink-0 sticky top-32 mt-8">
      <div>
        {/* Popular Communities */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-4 tracking-wide">
            POPULAR COMMUNITIES
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {data?.communities?.map((community) => (
                <Link
                  href={`/communities/r/${community._id}`}
                  key={community._id}
                  className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-muted/20 transition-all duration-200 cursor-pointer group"
                >
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={community.avatar || ''} alt={community.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {community.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {community.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMemberCount(community.memberCount)} members
                    </p>
                  </div>
                </Link>
              ))}

              {data?.communities?.length === 0 && (
                <p className="text-sm text-muted-foreground px-2">No communities found.</p>
              )}
            </div>
          )}

          <Link href="/communities" className="inline-block text-sm text-primary hover:text-primary/80 mt-3 px-2 font-medium">
            See more
          </Link>
        </div>
      </div>
    </div>
  );
}
