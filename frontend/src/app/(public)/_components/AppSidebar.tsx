"use client"

import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Home,
  Info,
  Code,
  HelpCircle,
  Users,
  Shield,
  Leaf,
  ChevronRight,
  Hash,
  Loader2,
  Sparkles,
  LayoutGrid
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useChatStore } from "@/store/chat-store"
import { CommunityActions } from "@/api-actions/community-actions"

// Primary navigation items
const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Communities",
    url: "/communities",
    icon: LayoutGrid,
  },
]

// Secondary/Support items
const supportNavItems = [
  {
    title: "Help Center",
    url: "/help",
    icon: HelpCircle,
  },
  {
    title: "Privacy Policy",
    url: "/privacy-policy",
    icon: Shield,
  },
  {
    title: "Developer Platform",
    url: "/developer",
    icon: Code,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { myCommunities, setMyCommunities } = useChatStore()
  const [isCommunitiesExpanded, setIsCommunitiesExpanded] = useState(true)
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false)

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ADMIN')

  // Filter support items based on role
  const filteredSupportItems = supportNavItems.filter(item =>
    item.title !== "Developer Platform" || isAdmin
  )

  // Fetch user communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      if (myCommunities.length === 0 && user) {
        try {
          setIsLoadingCommunities(true)
          const communities = await CommunityActions.GetUserCommunitiesAction()
          setMyCommunities(communities)
        } catch (error) {
          console.error("Failed to fetch communities:", error)
        } finally {
          setIsLoadingCommunities(false)
        }
      }
    }

    fetchCommunities()
  }, [user, myCommunities.length, setMyCommunities])

  const handleCommunityClick = (communityId: string) => {
    router.push(`/communities/r/${communityId}`)
  }

  // Get top 5 communities to display in sidebar
  const displayedCommunities = myCommunities.slice(0, 5)

  return (
    <Sidebar className="hidden md:flex border-r border-sidebar-border bg-sidebar h-full">
      {/* Header / Brand */}
      <SidebarHeader className="h-18 flex items-center justify-center border-b border-sidebar-border/50 px-4">
        <Link href="/" className="flex items-center gap-3 w-full hover:opacity-90 transition-opacity">
          <div className="flex size-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-transparent">
            <Leaf className="size-5 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Timber</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 space-y-6">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 mb-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`h-10 px-3 transition-all duration-200 ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`size-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Communities Section */}
        {user && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-2 group">
              <SidebarGroupLabel asChild>
                <Link href="/communities/my" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  Your Communities
                </Link>
              </SidebarGroupLabel>
              <button
                onClick={() => setIsCommunitiesExpanded(!isCommunitiesExpanded)}
                className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded-md hover:bg-accent"
              >
                <ChevronRight className={`size-3 transition-transform duration-200 ${isCommunitiesExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>

            <SidebarGroupContent className={`transition-all duration-300 ease-in-out ${isCommunitiesExpanded ? 'opacity-100 max-h-[500px]' : 'opacity-50 max-h-0 overflow-hidden'}`}>
              <SidebarMenu className="space-y-1">
                {isLoadingCommunities ? (
                  <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground/60 animate-pulse">
                    <div className="size-7 rounded-lg bg-sidebar-accent/50" />
                    <div className="h-4 w-24 bg-sidebar-accent/50 rounded" />
                  </div>
                ) : displayedCommunities.length > 0 ? (
                  <>
                    {displayedCommunities.map((community) => {
                      const isActive = pathname === `/communities/r/${community._id}`
                      return (
                        <SidebarMenuItem key={community._id}>
                          <SidebarMenuButton
                            asChild
                            className={`h-11 px-2.5 transition-all duration-200 group ${isActive ? "bg-sidebar-accent shadow-sm" : "hover:bg-sidebar-accent/50"
                              }`}
                          >
                            <Link href={`/communities/r/${community._id}`} className="flex items-center gap-3 w-full">
                              <div className="size-7 shrink-0 rounded-lg overflow-hidden ring-1 ring-border/50 group-hover:ring-border transition-shadow">
                                {community.avatar ? (
                                  <img
                                    src={community.avatar}
                                    alt={community.name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="size-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                                    <Hash className="size-3.5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className={`truncate text-sm ${isActive ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                {community.name}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="h-9 px-3 mt-1 text-xs text-muted-foreground hover:text-primary hover:bg-transparent">
                        <Link href="/communities/my" className="flex items-center gap-2">
                          <Sparkles className="size-3.5" />
                          <span>View All Communities</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">Join communities to see them here</p>
                    <Link href="/communities" className="text-xs font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                      Explore
                    </Link>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator className="mx-3 opacity-50" />

        {/* Support Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 mb-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredSupportItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`h-9 px-3 transition-colors ${isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4.5 opacity-80" strokeWidth={2} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="text-[10px] text-muted-foreground/60 leading-relaxed">
          © 2025 Timber Inc.
          All rights reserved.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
