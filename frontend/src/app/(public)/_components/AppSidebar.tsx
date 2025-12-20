"use client"

import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
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
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useChatStore } from "@/store/chat-store"
import { CommunityActions } from "@/api-actions/community-actions"

// All menu items in a single clean list - optimized order
const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Communities",
    url: "/communities",
    icon: Users,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
  {
    title: "Developer Platform",
    url: "/developer",
    icon: Code,
  },
  {
    title: "Privacy Policy",
    url: "/privacy-policy",
    icon: Shield,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { myCommunities, setMyCommunities } = useChatStore()
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false)
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false)
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ADMIN')

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

  const filteredMenuItems = menuItems.filter(item =>
    item.title !== "Developer Platform" || isAdmin
  )

  const handleCommunityClick = (communityId: string) => {
    router.push(`/communities/r/${communityId}`)
  }

  // Get top 3 communities to display
  const displayedCommunities = myCommunities.slice(0, 3)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-18 border-b border-sidebar-border p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent hover:text-sidebar-foreground mt-2 data-[state=open]:bg-transparent h-14 w-full px-4 group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:justify-center">
              <div className="cursor-default flex items-center">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex aspect-square size-10 items-center justify-center rounded-full p-[2px] shrink-0">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                    <Leaf className="size-5 text-emerald-400" />
                  </div>
                </div>
                <div className="grid flex-1 text-left leading-tight overflow-hidden ml-1 mt-2 group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold text-xl">Timber</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                // Special handling for Communities item - make it collapsible
                if (item.title === "Communities") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div className="relative group/communities">
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.title} 
                          className="text-base font-normal py-2.5 h-12 pr-8"
                        >
                          <Link href={item.url} className="flex items-center">
                            <item.icon className="size-5" strokeWidth={2.5} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsCommunitiesOpen(!isCommunitiesOpen)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors group-data-[collapsible=icon]:hidden"
                        >
                          <ChevronRight 
                            className={`size-4 transition-transform duration-200 text-muted-foreground ${isCommunitiesOpen ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                      
                      {isCommunitiesOpen && (
                        <div className="mt-2 mb-3 space-y-1">
                          {/* Section Header */}
                          <div className="flex items-center justify-between px-3 py-1.5">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Your Communities
                            </h3>
                          </div>

                          {isLoadingCommunities ? (
                            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              <span>Loading...</span>
                            </div>
                          ) : displayedCommunities.length > 0 ? (
                            <div className="space-y-0.5">
                              {displayedCommunities.map((community) => (
                                <button
                                  key={community._id}
                                  onClick={() => handleCommunityClick(community._id)}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/80 transition-all duration-150 group/item"
                                >
                                  {/* Avatar */}
                                  <div className="size-8 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                                    {community.avatar ? (
                                      <img 
                                        src={community.avatar} 
                                        alt={community.name}
                                        className="size-8 object-cover"
                                      />
                                    ) : (
                                      <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                        <Hash className="size-4 text-primary" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Community Name */}
                                  <span className="text-sm font-medium text-foreground group-hover/item:text-accent-foreground truncate">
                                    {community.name}
                                  </span>
                                </button>
                              ))}
                              
                              {/* View All Link */}
                              {myCommunities.length > 3 && (
                                <Link 
                                  href="/communities/my" 
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150 mt-1"
                                >
                                  <div className="size-8 flex items-center justify-center">
                                    <Users className="size-4" />
                                  </div>
                                  <span className="font-medium">View all communities ({myCommunities.length})</span>
                                </Link>
                              )}
                            </div>
                          ) : (
                            <div className="px-3 py-3 text-sm text-muted-foreground/70 italic">
                              No communities joined yet
                            </div>
                          )}
                        </div>
                      )}
                    </SidebarMenuItem>
                  )
                }

                // Regular menu items
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} className="text-base font-normal py-2.5 h-12">
                      <Link href={item.url}>
                        <item.icon className="size-5" strokeWidth={2.5} />
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
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
