"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommunityActions } from "@/api-actions/community-actions";
import { useChatStore } from "@/store/chat-store";
import { toast } from "sonner";
import { Search, Users, Hash, Lock, Loader2, UserPlus } from "lucide-react";

export function ExploreCommunities() {
  const { addCommunity, myCommunities } = useChatStore();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);

  const fetchCommunities = async (search?: string) => {
    try {
      setIsLoading(true);
      const response = await CommunityActions.GetAllCommunitiesAction(1, 50, search || "");
      setCommunities(response.communities);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      toast.error("Failed to load communities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunities(searchQuery);
  };

  const handleJoin = async (community: ICommunity) => {
    try {
      setJoiningId(community._id);
      await CommunityActions.JoinCommunityAction(community._id);
      
      // Fetch the full community details after joining
      const fullCommunity = await CommunityActions.GetCommunityByIdAction(community._id);
      addCommunity(fullCommunity);
      toast.success(`Joined ${community.name}!`);
      
      // Remove from available list
      setCommunities(communities.filter(c => c._id !== community._id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setJoiningId(null);
    }
  };

  const isJoined = (communityId: string) => {
    return myCommunities.some((c) => c._id === communityId);
  };

  const availableCommunities = communities.filter((c) => !isJoined(c._id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Explore Communities
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Explore Communities</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableCommunities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No communities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableCommunities.map((community) => (
                <Card key={community._id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {community.isPrivate ? (
                        <Lock className="h-6 w-6 text-primary" />
                      ) : (
                        <Hash className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{community.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {community.memberCount || community.members?.length || 0} members
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoin(community)}
                      disabled={joiningId === community._id}
                    >
                      {joiningId === community._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
