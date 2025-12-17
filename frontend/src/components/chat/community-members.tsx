"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CommunitySettings } from "./community-settings";
import { Users, Shield } from "lucide-react";

interface CommunityMembersProps {
  community: ICommunity;
}

export function CommunityMembers({ community }: CommunityMembersProps) {
  const admins = community.admins || [];
  const members = community.members || [];

  // Exclude admins from members list
  const regularMembers = members.filter(
    (member) => !admins.some((admin) => admin._id === member._id)
  );

  const totalMembers = admins.length + members.length;

  return (
    <div className="w-80 bg-card border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{community.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalMembers} members
            </p>
          </div>
          <CommunitySettings community={community} />
        </div>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Admins Section */}
          {admins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Admins — {admins.length}
                </h3>
              </div>
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.profile_picture} />
                      <AvatarFallback className="text-xs">
                        {admin.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{admin.username}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Members — {regularMembers.length}
                </h3>
              </div>
              <div className="space-y-2">
                {regularMembers.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profile_picture} />
                      <AvatarFallback className="text-xs">
                        {member.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {admins.length === 0 && regularMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No members found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
