"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Users, FolderOpen, Lightbulb, FileText, Type,
    TrendingUp, ShieldCheck, Search, Lock, Unlock,
    UserCheck, UserX, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    freeUsers: number;
    proUsers: number;
    businessUsers: number;
    totalProjects: number;
    totalIdeas: number;
    totalScripts: number;
    totalTitles: number;
    conversionRate: number;
}

interface AdminUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    accountLocked: boolean;
    plan: string;
    createdAt: string;
}

const planColors: Record<string, string> = {
    FREE: "bg-gray-500/10 text-gray-400",
    PRO: "bg-blue-500/10 text-blue-400",
    BUSINESS: "bg-purple-500/10 text-purple-400",
};

const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) => (
    <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default function AdminPage() {
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ["admin-stats"],
        queryFn: async () => (await api.get("/admin/stats")).data,
    });

    const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/admin/users?page=0&size=200");
            return res.data.content;
        },
    });

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    };

    // Lock / Unlock (accountLocked)
    const lockMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/users/${id}/lock`),
        onSuccess: () => { toast.success("Compte suspendu"); invalidate(); },
        onError: () => toast.error("Erreur lors de la suspension"),
    });

    const unlockMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/users/${id}/unlock`),
        onSuccess: () => { toast.success("Compte réactivé"); invalidate(); },
        onError: () => toast.error("Erreur lors de la réactivation"),
    });

    // Enable / Disable (enabled — confirmation email)
    const enableMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/users/${id}/enable`),
        onSuccess: () => { toast.success("Compte activé"); invalidate(); },
        onError: () => toast.error("Erreur lors de l'activation"),
    });

    const disableMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/admin/users/${id}/disable`),
        onSuccess: () => { toast.success("Compte désactivé"); invalidate(); },
        onError: () => toast.error("Erreur lors de la désactivation"),
    });

    // Change plan
    const planMutation = useMutation({
        mutationFn: ({ id, plan }: { id: number; plan: string }) =>
            api.patch(`/admin/users/${id}/plan?plan=${plan}`),
        onSuccess: () => { toast.success("Plan modifié"); invalidate(); },
        onError: () => toast.error("Erreur lors du changement de plan"),
    });

    const filtered = users.filter((u) => {
        const matchSearch =
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === "ALL" || u.plan === filterPlan;
        const matchStatus =
            filterStatus === "ALL" ||
            (filterStatus === "ACTIVE" && u.enabled && !u.accountLocked) ||
            (filterStatus === "DISABLED" && !u.enabled) ||
            (filterStatus === "LOCKED" && u.accountLocked);
        return matchSearch && matchPlan && matchStatus;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" /> Administration
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gestion des utilisateurs et statistiques de la plateforme
                </p>
            </div>

            {/* Stats */}
            {statsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} color="text-blue-500" />
                    <StatCard icon={UserCheck} label="Actifs" value={stats.activeUsers} color="text-green-500" />
                    <StatCard icon={TrendingUp} label="Conversion" value={`${stats.conversionRate}%`} color="text-purple-500" />
                    <StatCard icon={Users} label="FREE" value={stats.freeUsers} color="text-gray-400" />
                    <StatCard icon={Users} label="PRO" value={stats.proUsers} color="text-blue-400" />
                    <StatCard icon={Users} label="BUSINESS" value={stats.businessUsers} color="text-purple-400" />
                    <StatCard icon={FolderOpen} label="Projets" value={stats.totalProjects} color="text-orange-500" />
                    <StatCard icon={Lightbulb} label="Idées" value={stats.totalIdeas} color="text-yellow-500" />
                    <StatCard icon={FileText} label="Scripts" value={stats.totalScripts} color="text-green-500" />
                    <StatCard icon={Type} label="Titres" value={stats.totalTitles} color="text-pink-500" />
                </div>
            ) : null}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un utilisateur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les plans</SelectItem>
                        <SelectItem value="FREE">FREE</SelectItem>
                        <SelectItem value="PRO">PRO</SelectItem>
                        <SelectItem value="BUSINESS">BUSINESS</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                        <SelectItem value="ACTIVE">Actifs</SelectItem>
                        <SelectItem value="DISABLED">Non activés</SelectItem>
                        <SelectItem value="LOCKED">Suspendus</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Users table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">
                        Utilisateurs <span className="text-muted-foreground">({filtered.length})</span>
                    </h2>
                </div>

                {usersLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        Aucun utilisateur trouvé
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((user) => (
                            <div key={user.id}
                                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">

                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                                    {user.firstName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>

                                {/* Status badges */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!user.enabled && (
                                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                                            Non activé
                                        </Badge>
                                    )}
                                    {user.accountLocked && (
                                        <Badge variant="outline" className="text-xs text-red-500 border-red-500/30">
                                            Suspendu
                                        </Badge>
                                    )}
                                    {user.enabled && !user.accountLocked && (
                                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                            Actif
                                        </Badge>
                                    )}
                                </div>

                                {/* Plan badge */}
                                <Badge className={`text-xs flex-shrink-0 ${planColors[user.plan] ?? planColors.FREE}`}>
                                    {user.plan}
                                </Badge>

                                {/* Actions dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1 flex-shrink-0 h-8">
                                            Actions <ChevronDown className="w-3 h-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">

                                        {/* Activation du compte (enabled) */}
                                        {!user.enabled ? (
                                            <DropdownMenuItem
                                                className="text-green-500"
                                                onClick={() => enableMutation.mutate(user.id)}>
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Activer le compte
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                className="text-amber-500"
                                                onClick={() => disableMutation.mutate(user.id)}>
                                                <UserX className="w-4 h-4 mr-2" />
                                                Désactiver le compte
                                            </DropdownMenuItem>
                                        )}

                                        {/* Suspension (accountLocked) */}
                                        {user.accountLocked ? (
                                            <DropdownMenuItem
                                                onClick={() => unlockMutation.mutate(user.id)}>
                                                <Unlock className="w-4 h-4 mr-2" />
                                                Lever la suspension
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => lockMutation.mutate(user.id)}>
                                                <Lock className="w-4 h-4 mr-2" />
                                                Suspendre
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator />

                                        {/* Changement de plan */}
                                        {["FREE", "PRO", "BUSINESS"].filter(p => p !== user.plan).map((plan) => (
                                            <DropdownMenuItem
                                                key={plan}
                                                onClick={() => planMutation.mutate({ id: user.id, plan })}>
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                Passer en {plan}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}