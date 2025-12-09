"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { UserActions } from '@/api-actions/user-actions'
import { useAuthStore } from '@/store/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Grid3x3, Bookmark } from "lucide-react"
import { EditProfileDialog } from '../_components/EditProfileDialog'
import { FollowersDialog } from '../../_components/FollowersDialog'
import { FollowingDialog } from '../../_components/FollowingDialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useGetUserProfile } from '@/hooks/use-get-user-profile'
import { useQueryClient } from '@tanstack/react-query'
import { useGetPostsByUsername } from '@/hooks/use-get-posts-by-username'
import { useGetFollowers } from '@/hooks/use-get-followers'
import { useGetFollowing } from '@/hooks/use-get-following'

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading: loading } = useGetUserProfile(username);
  const { data: posts, isLoading: postsLoading } = useGetPostsByUsername(username);
  const { data: followersData, isLoading: followersLoading } = useGetFollowers(profile?._id || '', 1, 50);
  const { data: followingData, isLoading: followingLoading } = useGetFollowing(profile?._id || '', 1, 50);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  const handleFollow = async () => {
    if (!profile) return;
    if (!currentUser) {
        toast.error("Please login to follow");
        return;
    }
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await UserActions.UnfollowUserAction(profile._id);
        // Update cache optimistically
        queryClient.setQueryData(['userProfile', username], (old: IUserProfile | undefined) => 
          old ? { ...old, isFollowing: false, followersCount: (old.followersCount || 0) - 1 } : old
        );
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await UserActions.FollowUserAction(profile._id);
        // Update cache optimistically
        queryClient.setQueryData(['userProfile', username], (old: IUserProfile | undefined) => 
          old ? { ...old, isFollowing: true, followersCount: (old.followersCount || 0) + 1 } : old
        );
        toast.success(`Followed ${profile.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
      // Refetch to revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    } finally {
      setFollowLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10">User not found</div>;
  }

  const isOwner = currentUser?.username === profile.username;

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-20 mb-12">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start shrink-0">
            <Avatar className="h-36 w-36 md:h-44 md:w-44 ring-1 ring-border">
              <AvatarImage 
                src={profile.profile_picture || ""} 
                alt={profile.name} 
                className="object-cover h-full w-full"
              />
              <AvatarFallback className="flex items-center justify-center w-full h-full text-4xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white font-medium">
                {profile.name ? getInitials(profile.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-light tracking-tight">{profile.username}</h1>
              <div className="flex items-center gap-3">
                {isOwner ? (
                  <EditProfileDialog 
                    user={profile} 
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ['userProfile', username] })} 
                  />
                ) : (
                  <Button 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    variant={profile.isFollowing ? "outline" : "default"}
                    className="rounded-lg font-semibold text-sm px-8 h-9"
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-10 text-base">
              <div className="flex gap-1">
                <span className="font-semibold">{profile.postsCount || 0}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <button 
                className="flex gap-1 hover:text-foreground transition-colors"
                onClick={() => setShowFollowersDialog(true)}
              >
                <span className="font-semibold">{profile.followersCount || 0}</span>
                <span className="text-muted-foreground">followers</span>
              </button>
              <button 
                className="flex gap-1 hover:text-foreground transition-colors"
                onClick={() => setShowFollowingDialog(true)}
              >
                <span className="font-semibold">{profile.followingCount || 0}</span>
                <span className="text-muted-foreground">following</span>
              </button>
            </div>

            {/* Bio */}
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base">{profile.name}</p>
              {profile.bio && (
                <p className="whitespace-pre-wrap text-foreground">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex justify-center gap-16">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 py-4 border-t -mt-px transition-colors ${
                activeTab === "posts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="h-3 w-3" />
              <span className="text-xs font-semibold uppercase tracking-wider">Posts</span>
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 py-4 border-t -mt-px transition-colors ${
                  activeTab === "saved"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="h-3 w-3" />
                <span className="text-xs font-semibold uppercase tracking-wider">Saved</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-1">
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-1">
              {postsLoading ? (
                <div className="col-span-3 flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post._id}
                    className="aspect-square bg-muted relative group cursor-pointer overflow-hidden"
                  >
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0]}
                        alt={post.caption || 'Post'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-20 text-muted-foreground">
                  No posts yet
                </div>
              )}
            </div>
          )}
          {activeTab === "saved" && isOwner && (
            <div className="grid grid-cols-3 gap-1">
              <div className="col-span-3 text-center py-20 text-muted-foreground">
                No saved posts yet
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Followers Dialog */}
      <FollowersDialog
        open={showFollowersDialog}
        onOpenChange={setShowFollowersDialog}
        userId={profile._id}
        followers={followersData?.data || []}
        isLoading={followersLoading}
      />

      {/* Following Dialog */}
      <FollowingDialog
        open={showFollowingDialog}
        onOpenChange={setShowFollowingDialog}
        userId={profile._id}
        following={followingData?.data || []}
        isLoading={followingLoading}
      />
    </div>
  )
}
