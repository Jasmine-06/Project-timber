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
  TrendingUp, 
  List, 
  Clock, 
  Users, 
  BookOpen, 
  HelpCircle, 
  MessageCircle,
  Plus,
  Settings
} from "lucide-react"
import Link from "next/link"

// Menu items.
const feeds = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Popular",
    url: "/popular",
    icon: TrendingUp,
  },
  {
    title: "All",
    url: "/all",
    icon: List,
  },
]

const recent = [
  {
    title: "r/javascript",
    url: "/r/javascript",
    icon: MessageCircle,
  },
  {
    title: "r/reactjs",
    url: "/r/reactjs",
    icon: MessageCircle,
  },
  {
    title: "r/webdev",
    url: "/r/webdev",
    icon: MessageCircle,
  },
]

const communities = [
  {
    title: "Create Community",
    url: "/create-community",
    icon: Plus,
  },
  {
    title: "r/programming",
    url: "/r/programming",
    icon: MessageCircle,
  },
  {
    title: "r/technology",
    url: "/r/technology",
    icon: MessageCircle,
  },
]

const resources = [
  {
    title: "About",
    url: "/about",
    icon: BookOpen,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center px-4">
         <div className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
                <MessageCircle className="size-5" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">ChatCom</span>
         </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {feeds.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recent.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Communities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communities.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resources.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
