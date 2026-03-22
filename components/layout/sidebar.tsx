"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, FolderOpen, Lightbulb,
    FileText, Type, CreditCard, Settings,
    ChevronLeft, ChevronRight, Sparkles, LogOut, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
    { label: "Dashboard",   href: "/dashboard",    icon: LayoutDashboard },
    { label: "Projets",     href: "/projects",     icon: FolderOpen },
    { label: "Idees",       href: "/ideas",        icon: Lightbulb },
    { label: "Scripts",     href: "/scripts",      icon: FileText },
    { label: "Titres",      href: "/titles",       icon: Type },
    { label: "Abonnement",  href: "/subscription", icon: CreditCard, badge: "PRO" },
    { label: "Parametres",  href: "/settings",     icon: Settings },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { logout, role } = useAuthStore();
    const router = useRouter();
    const isAdmin = role === "ADMIN";

    // Rediriger les non-admins qui essaient d'accéder à /admin
    useEffect(() => {
        if (pathname.startsWith("/admin") && !isAdmin) {
            router.replace("/dashboard");
        }
    }, [pathname, isAdmin, router]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative flex flex-col h-screen bg-background border-r border-border flex-shrink-0"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-lg"
                            >
                                Armin
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}>
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 flex-1 min-w-0"
                                        >
                                            <span className="text-sm font-medium truncate">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <Badge variant="secondary" className="text-xs ml-auto">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}

                {/* Lien Admin — visible uniquement pour les ADMIN */}
                {isAdmin && (
                    <Link href="/admin">
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 mt-2",
                            pathname.startsWith("/admin")
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}>
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 flex-1 min-w-0"
                                    >
                                        <span className="text-sm font-medium truncate">Admin</span>
                                        <Badge className="text-xs ml-auto bg-red-500/10 text-red-400 border-red-500/20">
                                            Admin
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Link>
                )}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-4 border-t border-border pt-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
                     text-muted-foreground hover:bg-destructive/10
                     hover:text-destructive transition-all duration-150"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm font-medium"
                            >
                                Deconnexion
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Toggle */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background shadow-sm z-10"
            >
                {collapsed
                    ? <ChevronRight className="w-3 h-3" />
                    : <ChevronLeft className="w-3 h-3" />
                }
            </Button>
        </motion.aside>
    );
}