"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CommunityActions } from "@/api-actions/community-actions";
import { UploadActions } from "@/api-actions/upload-actions";
import { toast } from "sonner";
import { Loader2, Camera, Hash } from "lucide-react";

interface CommunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  community?: ICommunity;
  onSuccess?: (community: ICommunity) => void;
}

export function CommunityFormDialog({
  open,
  onOpenChange,
  mode,
  community,
  onSuccess,
}: CommunityFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Initialize form data when dialog opens or community changes
  useEffect(() => {
    if (mode === "edit" && community) {
      setFormData({
        name: community.name,
        description: community.description,
        isPrivate: community.isPrivate || false,
      });
      setAvatarPreview(community.avatar || "");
    } else {
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
      });
      setAvatarPreview("");
    }
    setAvatarFile(null);
    setUploadProgress(0);
  }, [mode, community, open]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setAvatarFile(selectedFile);
      setAvatarPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      let avatar = mode === "edit" && community ? community.avatar || "" : "";

      // Upload avatar if a new file is selected
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("images", avatarFile);
        const uploadRes = await UploadActions.UploadMediaAction(
          formDataUpload,
          setUploadProgress
        );
        if (uploadRes.images && uploadRes.images.length > 0) {
          avatar = uploadRes.images[0];
        }
      }

      let result: ICommunity;

      if (mode === "create") {
        result = await CommunityActions.CreateCommunityAction({
          ...formData,
          avatar: avatar || undefined,
        });
        toast.success("Community created successfully!");
      } else if (community) {
        result = await CommunityActions.UpdateCommunityAction(community._id, {
          ...formData,
          avatar: avatar || undefined,
        });
        toast.success("Community updated successfully!");
      } else {
        throw new Error("Community data missing for edit mode");
      }

      onOpenChange(false);
      onSuccess?.(result);

      // Reset form
      setFormData({ name: "", description: "", isPrivate: false });
      setAvatarFile(null);
      setAvatarPreview("");
      setUploadProgress(0);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${mode} community`
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Community" : "Edit Community"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new community for people to join and discuss"
              : "Update your community's information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="bg-primary/10">
                  <Hash className="h-10 w-10 text-primary" />
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="community-avatar"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <Input
                  id="community-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Upload a community avatar (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Community name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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

          {mode === "create" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPrivate" className="text-sm font-normal">
                Make this community private
              </Label>
            </div>
          )}

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading avatar...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Community"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
