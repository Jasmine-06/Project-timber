"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, FileText, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface Profile {
    name: string;
    email: string;
    avatar: string;
    username?: string;
    subscription?: string;
    model?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Eugene An",
    email: "eugene@kokonutui.com",
    avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
    subscription: "PRO",
    model: "Gemini 2.0 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
    showTopbar?: boolean;
    username?: string;
    onLogout?: () => void;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    username,
    onLogout,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuItems: MenuItem[] = [
        {
            label: "Profile",
            href: username ? `/u/${username}` : "#",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Settings",
            href: "#",
            icon: <Settings className="w-4 h-4" />,
        },
        {
            label: "Terms & Policies",
            href: "#",
            icon: <FileText className="w-4 h-4" />,
            external: true,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px] hover:shadow-lg transition-shadow duration-200">
                                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                                    <Image
                                        src={data.avatar}
                                        alt={data.name}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-52 p-1.5 bg-popover/95 dark:bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl 
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right"
                    >
                        {/* User Info Header */}
                        <div className="px-2.5 py-1.5 mb-1">
                            <div className="text-sm font-medium text-foreground truncate">
                                {data.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {data.email}
                            </div>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-1" />
                        <div className="space-y-0.5">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-accent rounded-md transition-colors cursor-pointer group"
                                    >
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors w-4 h-4 flex items-center justify-center">
                                            {item.icon}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {item.label}
                                        </span>
                                        {item.value && (
                                            <span className="text-xs font-medium rounded-md py-0.5 px-1.5 ml-auto bg-secondary text-secondary-foreground">
                                                {item.value}
                                            </span>
                                        )}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1.5" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-destructive/10 cursor-pointer transition-colors group"
                            >
                                <LogOut className="w-4 h-4 text-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
