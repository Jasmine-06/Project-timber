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

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { user } = useAuthStore()
  const [caption, setCaption] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

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
    console.log({ caption, images })
    setCaption("")
    setImages([])
    setPreviewUrls([])
    onOpenChange(false)
  }

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
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 p-0 text-xl text-foreground placeholder:text-muted-foreground bg-transparent rounded-none overflow-y-auto break-all whitespace-pre-wrap overflow-x-hidden"
                  maxLength={2000}
                />

                {/* Image Preview or Upload */}
                <div className="mt-3">
                  {previewUrls.length > 0 ? (
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <div className={`grid ${previewUrls.length === 1 ? 'grid-cols-1' : previewUrls.length === 2 ? 'grid-cols-2' : previewUrls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'} gap-0.5`}>
                        {previewUrls.map((url, index) => (
                          <div
                            key={index}
                            className={`relative bg-black overflow-hidden group ${previewUrls.length === 1 ? 'aspect-[16/10]' :
                              previewUrls.length === 3 && index === 0 ? 'row-span-2 aspect-square' :
                                'aect-square'
                              }`}
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
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
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
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v13c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.149H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.76 0-1.36-.602-1.36-1.375 0-.688.6-1.375 1.36-1.375z"></path>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary opacity-50"
                disabled
              >
                <MapPin className="h-5 w-5" />
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
                disabled={!caption && images.length === 0}
                size="sm"
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold rounded-full px-4 h-9"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}