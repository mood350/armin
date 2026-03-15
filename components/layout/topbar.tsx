"use client";

import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export function Topbar() {
    const { setTheme } = useTheme();
    const { logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="h-16 border-b border-border bg-background/95
                       backdrop-blur supports-backdrop-filter:bg-background/60
                       flex items-center justify-between px-6 shrink-0">
            <div />
            <div className="flex items-center gap-2">

                <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                </Button>

                {/* ✅ Pas de resolvedTheme — CSS Tailwind gère l'affichage */}
                <Button
                    variant="ghost"
                    size="icon"
                    suppressHydrationWarning
                    onClick={() => setTheme("light")}
                    className="dark:flex hidden"
                >
                    <Sun className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    suppressHydrationWarning
                    onClick={() => setTheme("dark")}
                    className="dark:hidden flex"
                >
                    <Moon className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mon profil</DropdownMenuItem>
                        <DropdownMenuItem>Parametres</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={handleLogout}
                        >
                            Deconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    );
}