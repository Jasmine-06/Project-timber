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
    url: "/privacy",
    icon: Shield,
  },
  {
    title: "User Agreement",
    url: "/user-agreement",
    icon: ScrollText,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent hover:text-sidebar-foreground data-[state=open]:bg-transparent">
              <div className="cursor-default">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex aspect-square size-8 items-center justify-center rounded-full p-[1px] shrink-0">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                    <Leaf className="size-4 text-emerald-400" />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                  <span className="truncate font-semibold">Timber</span>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="text-[15px] font-normal py-2.5">
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
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
