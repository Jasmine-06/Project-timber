import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Cake, Info } from 'lucide-react'

export function RightSidebar() {
  return (
    <div className="hidden md:flex flex-col gap-4 w-[310px] shrink-0">
      {/* Community Info Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 bg-primary/10 rounded-t-lg">
          <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-bold">Home</CardTitle>
             <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="text-xs">
            Your personal ChatCom frontpage. Come here to check in with your favorite communities.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
            <Separator />
            <div className="flex items-center gap-2">
                <Cake className="h-6 w-6 text-blue-500" />
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">Created</span>
                    <span className="text-sm font-bold">Dec 4, 2025</span>
                </div>
            </div>
            <Separator />
            <Button className="w-full rounded-full font-bold">Create Post</Button>
            <Button variant="outline" className="w-full rounded-full font-bold">Create Community</Button>
        </CardContent>
      </Card>

      {/* Premium Card */}
      <Card className="bg-card border-border">
         <CardContent className="pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold">Timber Premium</span>
                    <span className="text-xs text-muted-foreground">The best ChatCom experience</span>
                </div>
            </div>
            <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold mt-2">
                Try Now
            </Button>
         </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="bg-card border border-border rounded-md p-4 text-xs text-muted-foreground">
         <div className="grid grid-cols-2 gap-2 mb-4">
            <span className="cursor-pointer hover:underline">User Agreement</span>
            <span className="cursor-pointer hover:underline">Privacy Policy</span>
            <span className="cursor-pointer hover:underline">Content Policy</span>
            <span className="cursor-pointer hover:underline">Moderator Code of Conduct</span>
         </div>
         <Separator className="mb-4" />
         <span>ChatCom © 2025. All rights reserved.</span>
      </div>
    </div>
  )
}
