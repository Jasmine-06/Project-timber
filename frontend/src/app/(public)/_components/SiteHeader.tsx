"use client";

import { Search, MessageCircle, Plus, Leaf } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth-store'
import Link from 'next/link'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchUsers } from '@/hooks/use-search-users'
import { AvatarImage } from "@/components/ui/avatar"
import { CreatePostDialog } from './CreatePostDialog'
import { useQueryClient } from '@tanstack/react-query'
import ProfileDropdown from '@/components/kokonutui/profile-dropdown'
import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher'

export function SiteHeader() {
  const { isAuthenticated, user, setLogout, isLoading } = useAuthStore()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)
  const { users: searchResults, isLoading: isSearching } = useSearchUsers(debouncedSearch)

  const handleLogout = () => {
    // Invalidate queries to clear personalized data before logging out
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['bookmarkedPosts'] });

    // Clear auth state
    setLogout();
  }

  return (
    <header className="sticky top-0 z-50 flex h-18 shrink-0 items-center gap-2 border-b border-border bg-background px-4 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-12 w-12 [&_svg]:size-6" />
        <Separator orientation="vertical" className="mr-2 h-10" />
        <div className="flex items-center gap-2 font-bold text-xl md:hidden">
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex aspect-square size-10 items-center justify-center rounded-full p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
              <Leaf className="size-6 text-emerald-400" />
            </div>
          </div>
          <span>Timber</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ChatCom"
            className="w-full bg-muted/50 pl-9 rounded-full focus-visible:ring-0 focus-visible:bg-background transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click on result
          />

          {/* Search Results Dropdown */}
          {isSearchFocused && debouncedSearch && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking inside dropdown
            >
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((user: IUser) => (
                    <Link
                      key={user._id}
                      href={`/u/${user.username}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSearchQuery("")
                        setIsSearchFocused(false)
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_picture} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No users found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground h-12 w-12">
          <Search className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex text-muted-foreground h-12 w-12"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <MessageCircle className="h-6 w-6" />
        </Button>

        <ThemeSwitcher />

        <div className="ml-2">
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <ProfileDropdown
              data={{
                name: user.name,
                email: user.email,
                avatar: user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
              }}
              username={user.username}
              onLogout={handleLogout}
            />
          ) : (
            <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              <Link href="/login">
                Log In
              </Link>
            </Button>
          )}
        </div>
      </div>

      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </header>
  )
}
