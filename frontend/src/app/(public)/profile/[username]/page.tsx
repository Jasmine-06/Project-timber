"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { UserActions } from '@/api-actions/user-actions'
import { useAuthStore } from '@/store/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EditProfileDialog } from '../_components/EditProfileDialog'
import { PostCard } from '../../_components/PostCard'
import { toast } from 'sonner'
import { Loader2, CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await UserActions.GetUserProfileAction(username);
      setProfile(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

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
        setProfile(prev => prev ? ({ ...prev, isFollowing: false, followersCount: prev.followersCount - 1 }) : null);
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await UserActions.FollowUserAction(profile._id);
        setProfile(prev => prev ? ({ ...prev, isFollowing: true, followersCount: prev.followersCount + 1 }) : null);
        toast.success(`Followed ${profile.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

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
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-4">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
          <AvatarImage src={profile.profile_picture} className="object-cover" />
          <AvatarFallback className="text-4xl">{profile.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">u/{profile.username}</p>
            </div>
            <div className="flex gap-2">
                {isOwner ? (
                    <EditProfileDialog user={profile} onUpdate={fetchProfile} />
                ) : (
                    <Button 
                        onClick={handleFollow} 
                        disabled={followLoading}
                        variant={profile.isFollowing ? "outline" : "default"}
                        className="rounded-full font-bold min-w-[100px]"
                    >
                        {profile.isFollowing ? "Following" : "Follow"}
                    </Button>
                )}
            </div>
          </div>

          {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}

          <div className="flex gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">{profile.followersCount}</span> Followers
             </div>
             <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">{profile.followingCount}</span> Following
             </div>
             <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>Joined {profile.createdAt ? format(parseISO(profile.createdAt), 'MMM yyyy') : 'N/A'}</span>
             </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
          <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
            Posts
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
            Comments
          </TabsTrigger>
          <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
            About
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="pt-4">
            <div className="flex flex-col gap-4">
                 {/* Placeholder for user posts - In a real app, fetch these */}
                 <div className="text-center py-10 text-muted-foreground">
                    No posts yet
                 </div>
            </div>
        </TabsContent>
        
        <TabsContent value="comments" className="pt-4">
            <div className="text-center py-10 text-muted-foreground">
                No comments yet
            </div>
        </TabsContent>

        <TabsContent value="about" className="pt-4">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="font-bold mb-1">About</h3>
                        <p className="text-sm text-muted-foreground">{profile.bio || "No bio available"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <h3 className="font-bold mb-1 text-sm">Cake Day</h3>
                            <p className="text-sm text-muted-foreground">{profile.createdAt ? format(parseISO(profile.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
