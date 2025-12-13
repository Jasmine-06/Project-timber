"use client";

import { useState } from 'react'
import { X, ImageIcon, Smile, Calendar, MapPin, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/store/auth-store'
import FileUpload from '@/components/kokonutui/file-upload'
import { useCreatePost } from '@/hooks/use-create-post'
import { useUploadMedia } from '@/hooks/use-upload-media'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { user } = useAuthStore()
  const [caption, setCaption] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // TanStack Query mutations
  const createPostMutation = useCreatePost()
  const uploadMediaMutation = useUploadMedia()

  const handleFileUpload = (file: File) => {
    setImages(prev => [...prev, file])

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrls(prev => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      let imageUrls: string[] = []

      // Step 1: Upload images if any exist
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach(image => {
          formData.append('images', image)
        })

        const uploadResult = await uploadMediaMutation.mutateAsync({
          formData,
          onProgress: setUploadProgress
        })
        imageUrls = uploadResult.images
      }

      // Step 2: Create post with caption and uploaded image URLs
      await createPostMutation.mutateAsync({
        caption: caption || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined
      })

      // Step 3: Clear form and close dialog on success
      setCaption("")
      setImages([])
      setPreviewUrls([])
      setUploadProgress(0)
      onOpenChange(false)
    } catch (error) {
      // Errors are handled by the mutation hooks
      console.error('Error creating post:', error)
    }
  }

  const isLoading = uploadMediaMutation.isPending || createPostMutation.isPending


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 rounded-2xl border border-border bg-background">
        <DialogHeader className="px-4 py-3 flex flex-row items-center justify-between border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full h-8 w-8 hover:bg-muted -ml-2"
          >
            <X className="h-5 w-5 text-foreground" />
          </Button>
          <DialogTitle className="text-foreground font-bold text-base sr-only">Create post</DialogTitle>
          <div className="w-8"></div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-4 py-3">
            <div className="flex gap-3">
              {/* User Avatar */}
              <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="rounded-full bg-primary text-primary-foreground">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Caption Input */}
                <Textarea
                  placeholder="What is happening?!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 p-0 text-xl text-foreground placeholder:text-muted-foreground bg-transparent rounded-none overflow-y-auto break-all whitespace-pre-wrap overflow-x-hidden disabled:opacity-50"
                  maxLength={2000}
                />

                {/* Image Preview or Upload */}
                <div className="mt-3">
                  {previewUrls.length > 0 ? (
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <div className={`grid ${previewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
                        {previewUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative bg-black overflow-hidden group aspect-square"
                          >
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-background/80 hover:bg-muted"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4 text-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="hidden">
                      <FileUpload
                        onUploadSuccess={handleFileUpload}
                        acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                        maxFileSize={10 * 1024 * 1024}
                        uploadDelay={0}
                        className="w-full max-w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Everyone can reply indicator */}
                <div className="mt-4 flex items-center gap-1 text-sm text-primary font-semibold">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM12 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path>
                    <path d="M12 17.5c-3 0-5.5-2.5-5.5-5.5S9 6.5 12 6.5s5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5zm0-9c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5z"></path>
                  </svg>
                  <span>Everyone can reply</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center -ml-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary disabled:opacity-50"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || [])
                    files.forEach(file => {
                      if (file.size <= 10 * 1024 * 1024) {
                        handleFileUpload(file)
                      }
                    })
                  }
                  input.click()
                }}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {caption.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg height="20" width="20" className="-rotate-90">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      className="text-muted"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke={caption.length > 2000 ? "var(--destructive)" : caption.length > 1800 ? "var(--chart-4)" : "var(--primary)"}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${(caption.length / 2000) * 50.27} 50.27`}
                    />
                  </svg>
                  {caption.length > 1800 && (
                    <span className={`text-xs ${caption.length > 2000 ? 'text-destructive' : 'text-chart-4'}`}>
                      {2000 - caption.length}
                    </span>
                  )}
                </div>
              )}

              <div className="w-px h-8 bg-border"></div>

              <Button
                onClick={handleSubmit}
                disabled={(!caption && images.length === 0) || isLoading}
                size="sm"
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold rounded-full px-4 h-9"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadMediaMutation.isPending ? 'Uploading...' : 'Posting...'}
                  </span>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}