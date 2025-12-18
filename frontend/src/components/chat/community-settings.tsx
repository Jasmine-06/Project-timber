"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommunityActions } from "@/api-actions/community-actions";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { CommunityFormDialog } from "./community-form-dialog";

interface CommunitySettingsProps {
  community: ICommunity;
}

export function CommunitySettings({ community }: CommunitySettingsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateCommunity, removeCommunity, setActiveCommunity } = useChatStore();
  const { user } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = community.admins?.some((admin) => admin._id === user?._id);

  if (!isAdmin) {
    return null; // Don't show settings to non-admins
  }

  const handleEditSuccess = (updatedCommunity: ICommunity) => {
    updateCommunity(community._id, updatedCommunity);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await CommunityActions.DeleteCommunityAction(community._id);
      removeCommunity(community._id);
      setActiveCommunity(null);
      setIsDeleteOpen(false);
      
      // Navigate first
      router.push("/communities");
      
      // Then invalidate and refetch the communities query
      await queryClient.invalidateQueries({ 
        queryKey: ["communities"],
        refetchType: "active"
      });
      
      toast.success("Community deleted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete community");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Community
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Community
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <CommunityFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        community={community}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              community <strong>{community.name}</strong> and remove all associated
              data including messages and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Community"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
