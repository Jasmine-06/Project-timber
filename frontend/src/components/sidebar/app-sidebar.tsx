"use client"

import * as React from "react"
import {
  Code,
  FileCheck,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Library,
  LifeBuoy,
  Lock,
  Send,
  Shield,
  Users,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "../kibo-ui/theme-switcher"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true
    },
    {
      title: "Resources",
      url: "/",
      icon: Library,
      items: [
        {
          title: "About Timber",
          url: "/",
          icon: Info,
        },
        {
          title: "Developer Platform",
          url: "/developer",
          icon: Code,
        },
        {
          title: "Help",
          url: "/",
          icon: HelpCircle,
        },
      ],
    },
    {
      title: "Communities",
      url: "/",
      icon: Users
    },

  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
 
  termsAndConditions: [
    {
      name: "Timber Rules",
      url: "#",
      icon: Shield,
    },
    {
      name: "Privacy Policy",
      url: "#",
      icon: Lock,
    },
    {
      name: "User Agreement",
      url: "#",
      icon: FileCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex aspect-square size-8 items-center justify-center rounded-full p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                    <Leaf className="size-4 text-emerald-400" />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium">Timber</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.termsAndConditions} />
         
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <ThemeSwitcher/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
