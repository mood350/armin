"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Users, TrendingUp, FolderOpen, Lightbulb,
    FileText, Type, Lock, Unlock, Search,
    ShieldCheck, Crown, Zap, Sparkles, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
    firstName: string;
    lastName: string;
    email: string;
    enabled: boolean;
    accountLocked: boolean;
    plan: "FREE" | "PRO" | "BUSINESS";
    createdAt: string;
}

const planConfig = {
    FREE:     { label: "Free",     icon: Zap,      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
    PRO:      { label: "Pro",      icon: Crown,     color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    BUSINESS: { label: "Business", icon: Sparkles,  color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

// ✅ Sorti du composant pour éviter react-hooks/static-components
interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    sub?: string;
    color: string;
}

function StatCard({ label, value, icon: Icon, sub, color }: StatCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
    );
}

export default function AdminPage() {
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ["admin-stats"],
        queryFn: async () => (await api.get("/api/admin/stats")).data,
    });

    const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/api/admin/users?page=0&size=100");
            return res.data.content; // ← extraire le tableau depuis la Page Spring
        },
    });

    const lockMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/api/admin/users/${id}/lock`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Compte verrouille");
        },
    });

    const unlockMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/api/admin/users/${id}/unlock`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Compte deverrouille");
        },
    });

    const planMutation = useMutation({
        mutationFn: ({ id, plan }: { id: number; plan: string }) =>
            api.patch(`/api/admin/users/${id}/plan?plan=${plan}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["admin-users", "admin-stats"] });
            toast.success("Plan mis a jour");
        },
    });

    const filtered = users.filter((u) => {
        const matchSearch =
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === "ALL" || u.plan === filterPlan;
        const matchStatus =
            filterStatus === "ALL" ||
            (filterStatus === "ACTIVE" && u.enabled && !u.accountLocked) ||
            (filterStatus === "LOCKED" && u.accountLocked) ||
            (filterStatus === "INACTIVE" && !u.enabled);
        return matchSearch && matchPlan && matchStatus;
    });

    const payingRate = stats && stats.totalUsers > 0
        ? (((stats.proUsers + stats.businessUsers) / stats.totalUsers) * 100).toFixed(1)
        : "0";

    const payingWidth = stats && stats.totalUsers > 0
        ? `${((stats.proUsers + stats.businessUsers) / stats.totalUsers) * 100}%`
        : "0%";

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl">

            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h1 className="text-2xl font-bold">Administration</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Gestion des utilisateurs et statistiques
                    </p>
                </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statsLoading ? (
                    [...Array(10)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                ) : stats ? (
                    <>
                        <StatCard label="Utilisateurs" value={stats.totalUsers} icon={Users}
                                  sub={`${stats.activeUsers} actifs`} color="bg-blue-500/10 text-blue-500" />
                        <StatCard label="Free" value={stats.freeUsers} icon={Zap}
                                  color="bg-zinc-500/10 text-zinc-400" />
                        <StatCard label="Pro" value={stats.proUsers} icon={Crown}
                                  color="bg-blue-500/10 text-blue-400" />
                        <StatCard label="Business" value={stats.businessUsers} icon={Sparkles}
                                  color="bg-purple-500/10 text-purple-400" />
                        <StatCard label="Conversion" value={`${stats.conversionRate.toFixed(1)}%`}
                                  icon={TrendingUp} sub="Free vers Payant" color="bg-green-500/10 text-green-500" />
                        <StatCard label="Projets" value={stats.totalProjects} icon={FolderOpen}
                                  color="bg-orange-500/10 text-orange-500" />
                        <StatCard label="Idees" value={stats.totalIdeas} icon={Lightbulb}
                                  color="bg-yellow-500/10 text-yellow-500" />
                        <StatCard label="Scripts" value={stats.totalScripts} icon={FileText}
                                  color="bg-cyan-500/10 text-cyan-500" />
                        <StatCard label="Titres" value={stats.totalTitles} icon={Type}
                                  color="bg-pink-500/10 text-pink-500" />
                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
                            <span className="text-sm text-muted-foreground">Taux payants</span>
                            <div>
                                <div className="text-2xl font-bold">{payingRate}%</div>
                                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-blue-500 to-purple-500"
                                        style={{ width: payingWidth }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </motion.div>

            {/* Users table */}
            <motion.div variants={item} className="space-y-4">
                <h2 className="text-lg font-semibold">Utilisateurs ({filtered.length})</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
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
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="PRO">Pro</SelectItem>
                            <SelectItem value="BUSINESS">Business</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous</SelectItem>
                            <SelectItem value="ACTIVE">Actifs</SelectItem>
                            <SelectItem value="LOCKED">Verouilles</SelectItem>
                            <SelectItem value="INACTIVE">Inactifs</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Utilisateur</th>
                                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Plan</th>
                                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Statut</th>
                                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Inscription</th>
                                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {usersLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b border-border last:border-0">
                                        <td colSpan={6} className="px-4 py-3">
                                            <Skeleton className="h-6 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                        Aucun utilisateur trouve
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => {
                                    const plan = planConfig[user.plan];
                                    const PlanIcon = plan.icon;
                                    return (
                                        <tr key={user.id}
                                            className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <span className="font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <Select
                                                    value={user.plan}
                                                    onValueChange={(val) => planMutation.mutate({ id: user.id, plan: val })}
                                                >
                                                    <SelectTrigger className={`w-32 h-7 text-xs border ${plan.color}`}>
                                                        <PlanIcon className="w-3 h-3 mr-1" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="FREE">Free</SelectItem>
                                                        <SelectItem value="PRO">Pro</SelectItem>
                                                        <SelectItem value="BUSINESS">Business</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.accountLocked ? (
                                                    <Badge variant="outline" className="text-xs border-red-500/30 text-red-400 bg-red-500/10">
                                                        Verouille
                                                    </Badge>
                                                ) : user.enabled ? (
                                                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                                                        Actif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                                                        Inactif
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {user.accountLocked ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-green-500 hover:bg-green-500/10"
                                                            onClick={() => unlockMutation.mutate(user.id)}
                                                            disabled={unlockMutation.isPending}
                                                        >
                                                            {unlockMutation.isPending
                                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                : <Unlock className="w-4 h-4" />}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => lockMutation.mutate(user.id)}
                                                            disabled={lockMutation.isPending}
                                                        >
                                                            {lockMutation.isPending
                                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                : <Lock className="w-4 h-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}