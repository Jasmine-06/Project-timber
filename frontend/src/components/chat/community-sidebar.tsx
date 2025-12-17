"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommunityActions } from "@/api-actions/community-actions";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Plus, Users, Search, Hash, Lock, Loader2 } from "lucide-react";

export function CommunitySidebar() {
  const { myCommunities, setMyCommunities, activeCommunity, setActiveCommunity, addCommunity } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ 
    name: "", 
    description: "",
    isPrivate: false 
  });

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

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const community = await CommunityActions.CreateCommunityAction(newCommunity);
      addCommunity(community);
      setActiveCommunity(community);
      toast.success("Community created successfully!");
      setIsCreateDialogOpen(false);
      setNewCommunity({ name: "", description: "", isPrivate: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create community");
    } finally {
      setIsCreating(false);
    }
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Community name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this community about?"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPrivate" className="text-sm font-normal">
                    Make this community private
                  </Label>
                </div>
                <Button 
                  onClick={handleCreateCommunity} 
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Community"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                    {community.isPrivate ? (
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
