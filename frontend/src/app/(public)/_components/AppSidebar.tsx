"use client"

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
  FileText,
  Shield,
  ScrollText,
  Leaf
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"

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
    title: "About Timber",
    url: "/about",
    icon: Info,
  },
  {
    title: "Developer Platform",
    url: "/developer",
    icon: Code,
  },
  {
    title: "Timber Rules",
    url: "/rules",
    icon: FileText,
  },
  {
    title: "Privacy Policy",
    url: "/privacy-policy",
    icon: Shield,
  },
  {
    title: "User Agreement",
    url: "/agreement",
    icon: ScrollText,
  },
]

export function AppSidebar() {
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ADMIN')

  const filteredMenuItems = menuItems.filter(item =>
    item.title !== "Developer Platform" || isAdmin
  )

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
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="text-base font-normal py-2.5 h-12">
                    <Link href={item.url}>
                      <item.icon className="size-8" strokeWidth={2.5} />
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
