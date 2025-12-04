import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserActions } from "@/api-actions/user-actions"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface EditProfileDialogProps {
  user: IUserProfile;
  onUpdate: () => void;
}

export function EditProfileDialog({ user, onUpdate }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.profile_picture);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profile_picture = user.profile_picture;

      if (file) {
        const formData = new FormData();
        formData.append("images", file);
        const uploadRes = await UserActions.UploadMediaAction(formData);
        if (uploadRes.images && uploadRes.images.length > 0) {
          profile_picture = uploadRes.images[0];
        }
      }

      const updatedUser = await UserActions.UpdateUserProfileAction({
        name,
        bio,
        profile_picture,
      });

      setUser(updatedUser); // Update store
      onUpdate(); // Refresh parent
      setOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full font-bold">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
             <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={preview} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <Label htmlFor="picture" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                    <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </Label>
             </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
