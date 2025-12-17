"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityActions } from "@/api-actions/community-actions";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CommunitiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar: "",
  });

  const { data: communitiesResponse, isLoading } = useQuery({
    queryKey: ["communities", "all"],
    queryFn: () => CommunityActions.GetAllCommunitiesAction(1, 50, ""),
  });

  const communities = communitiesResponse?.communities || [];

  const handleCommunityClick = (communityId: string) => {
    router.push(`/communities/r/${communityId}`);
  };

  const handleCreateCommunity = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      const newCommunity = await CommunityActions.CreateCommunityAction({
        name: formData.name,
        description: formData.description,
        avatar: formData.avatar || undefined,
      });
      
      // Invalidate and refetch communities
      await queryClient.invalidateQueries({ 
        queryKey: ["communities"],
        refetchType: "active"
      });
      
      toast.success("Community created successfully!");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", avatar: "" });
      
      // Navigate to the new community
      router.push(`/communities/r/${newCommunity._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create community");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">Top Communities</h1>
            <p className="text-sm text-muted-foreground">Timber's largest communities</p>
          </div>
          
          {/* Create Community Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
                <DialogDescription>
                  Create a new community for people to join and discuss
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Community name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this community about?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCommunity} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Communities List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No communities found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {communities.map((community, index) => (
              <div
                key={community._id}
                className="flex items-start gap-2 p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleCommunityClick(community._id)}
              >
                {/* Rank Number */}
                <div className="text-sm font-medium text-muted-foreground min-w-[24px] pt-1">
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={community.avatar || community.image} alt={community.name} />
                  <AvatarFallback className="bg-muted text-foreground text-lg border border-border">
                    {/* Fallback to first letter or emoji if name is "r/..." */}
                    {community.name.replace("r/", "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Community Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium text-sm text-foreground truncate hover:underline"
                  >
                    {community.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {community.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {community.memberCount || community.members?.length || 0} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
