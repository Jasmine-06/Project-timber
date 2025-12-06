"use client";

import { useState } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
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
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-none border-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center font-semibold text-base">Create new post</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="px-4 py-3 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 rounded-none">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="rounded-none">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">{user?.username}</span>
            </div>

            {/* Caption Input */}
            <Textarea
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[80px] max-h-[120px] resize-none border-0 focus-visible:ring-0 p-0 text-sm rounded-none overflow-y-auto break-all whitespace-pre-wrap overflow-x-hidden"
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {caption.length}/2000
            </div>

            {/* Image Preview or Upload */}
            {previewUrls.length > 0 ? (
              <div className="border rounded-none p-2">
                <div className="grid grid-cols-2 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square bg-muted rounded-none overflow-hidden group">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <FileUpload
                onUploadSuccess={handleFileUpload}
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                maxFileSize={10 * 1024 * 1024}
                uploadDelay={0}
                className="w-full max-w-full"
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-2">
          <div>
            {previewUrls.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none"
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
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Images
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!caption && images.length === 0}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-none"
            >
              Share Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
