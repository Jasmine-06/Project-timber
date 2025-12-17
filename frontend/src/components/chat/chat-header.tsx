"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { socketService } from "@/lib/socket";
import { CommunityActions } from "@/api-actions/community-actions";
import { ExploreCommunities } from "./explore-communities";
import { toast } from "sonner";
import { LogOut, User, UserPlus, Loader2 } from "lucide-react";

export function ChatHeader() {
  const router = useRouter();
  const { user, setLogout } = useAuthStore();
  const { activeCommunity, myCommunities, addCommunity } = useChatStore();
  const [isJoining, setIsJoining] = useState(false);

  const handleLogout = async () => {
    try {
      socketService.disconnect();
      setLogout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      socketService.disconnect();
      setLogout();
      router.push("/login");
    }
  };

  const handleJoinCommunity = async () => {
    if (!activeCommunity) return;

    try {
      setIsJoining(true);
      await CommunityActions.JoinCommunityAction(activeCommunity._id);
      
      // Fetch the full community details after joining
      const fullCommunity = await CommunityActions.GetCommunityByIdAction(activeCommunity._id);
      addCommunity(fullCommunity);
      toast.success(`Joined ${activeCommunity.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  // Check if user has already joined the active community
  const hasJoined = activeCommunity 
    ? myCommunities.some((c) => c._id === activeCommunity._id)
    : false;

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {/* Show Join button only if viewing a community and haven't joined */}
        {activeCommunity && !hasJoined && (
          <Button 
            onClick={handleJoinCommunity}
            disabled={isJoining}
            className="gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Join
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ExploreCommunities />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profile_picture} alt={user?.username} />
                <AvatarFallback className="bg-primary/10">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
