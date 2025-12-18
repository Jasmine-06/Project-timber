"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CommunityActions } from "@/api-actions/community-actions";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Plus, Users, Search, Hash, Lock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityFormDialog } from "./community-form-dialog";

export function CommunitySidebar() {
  const { myCommunities, setMyCommunities, activeCommunity, setActiveCommunity, addCommunity } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCommunities();
    }
  }, [isAuthenticated]);

  const fetchMyCommunities = async () => {
    try {
      setIsLoading(true);
      const communities = await CommunityActions.GetUserCommunitiesAction();
      setMyCommunities(communities);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      toast.error("Failed to load communities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (community: ICommunity) => {
    addCommunity(community);
    setActiveCommunity(community);
  };

  const filteredCommunities = myCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-card border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Communities</h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <CommunityFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          mode="create"
          onSuccess={handleCreateSuccess}
        />
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Communities List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No communities yet</p>
              <p className="text-xs mt-1">Create or join a community to get started</p>
            </div>
          ) : (
            filteredCommunities.map((community) => (
              <Card
                key={community._id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  activeCommunity?._id === community._id ? "bg-accent border-primary" : ""
                }`}
                onClick={() => setActiveCommunity(community)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {community.avatar ? (
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={community.avatar} />
                        <AvatarFallback>
                          {community.isPrivate ? (
                            <Lock className="h-5 w-5 text-primary" />
                          ) : (
                            <Hash className="h-5 w-5 text-primary" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    ) : community.isPrivate ? (
                      <Lock className="h-5 w-5 text-primary" />
                    ) : (
                      <Hash className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{community.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {community.memberCount || community.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
