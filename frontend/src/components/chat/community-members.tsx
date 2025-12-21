"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CommunitySettings } from "./community-settings";
import { Users, Shield, LogOut } from "lucide-react";
import { getTotalMemberCount, getRegularMembers } from "@/lib/community-utils";
import { useChatStore } from "@/store/chat-store";
import { CommunityActions } from "@/api-actions/community-actions";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

interface CommunityMembersProps {
  community: ICommunity;
}

export function CommunityMembers({ community }: CommunityMembersProps) {
  const router = useRouter();
  const { removeCommunity } = useChatStore();
  const { user } = useAuthStore();
  const admins = community.admins || [];
  const regularMembers = getRegularMembers(community);
  const totalMembers = getTotalMemberCount(community);

  const handleLeaveCommunity = async () => {
    try {
      await CommunityActions.LeaveCommunityAction(community._id);
      removeCommunity(community._id);
      toast.success("Left community successfully");
      router.push("/communities");
    } catch (error) {
      toast.error("Failed to leave community");
    }
  };

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

      <div className="p-2 border-t bg-card mt-auto space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-normal"
          onClick={() => toast.info("Coming soon")}
        >
          <div className="h-4 w-4 flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          Report community
        </Button>

        {regularMembers.some(m => m._id === user?._id) && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 font-normal"
            onClick={handleLeaveCommunity}
          >
            <div className="h-4 w-4 flex items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            Exit community
          </Button>
        )}
      </div>
    </div>
  );
}
