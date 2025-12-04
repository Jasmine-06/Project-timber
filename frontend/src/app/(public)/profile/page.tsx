"use client"
import { useAuthStore } from "@/store/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Grid3x3, Bookmark } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
        <div className="flex-1 bg-background min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-20 mb-12">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start shrink-0">
                <Avatar className="h-36 w-36 md:h-44 md:w-44 ring-1 ring-border">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white font-medium">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-light tracking-tight">{user?.username || "username"}</h1>
                </div>

                {/* Stats */}
                <div className="flex gap-10 text-base">
                  <div className="flex gap-1">
                    <span className="font-semibold">5</span>
                    <span className="text-muted-foreground">posts</span>
                  </div>
                  <button className="flex gap-1 hover:text-muted-foreground transition-colors">
                    <span className="font-semibold">373</span>
                    <span className="text-muted-foreground">followers</span>
                  </button>
                  <button className="flex gap-1 hover:text-muted-foreground transition-colors">
                    <span className="font-semibold">286</span>
                    <span className="text-muted-foreground">following</span>
                  </button>
                </div>

                {/* Bio */}
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-base">{user?.name || "Name"}</p>
                  <p>🤘🤘</p>
                  <p>~challenge accepter</p>
                  <p className="text-emerald-600 dark:text-emerald-400">#exkvian</p>
                  <p className="text-muted-foreground">@{user?.username || "username"}</p>
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
              </div>
            </div>

            {/* Content Grid */}
            <div className="mt-1">
              {activeTab === "posts" && (
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((post) => (
                    <div
                      key={post}
                      className="aspect-square bg-muted relative group cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "saved" && (
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((post) => (
                    <div
                      key={post}
                      className="aspect-square bg-muted relative group cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
  )
}