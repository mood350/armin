"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Lightbulb, FileText, Type, FolderOpen,
    TrendingUp, Zap, ArrowRight, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { DashboardData } from "@/types";
import { useRouter } from "next/navigation";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const planColors = {
    FREE:     "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PRO:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    BUSINESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const activityTypeConfig = {
    SCRIPT: { icon: FileText, color: "text-green-500", bg: "bg-green-500/10" },
    IDEA:   { icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    TITLE:  { icon: Type, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function DashboardPage() {
    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => (await api.get("/dashboard")).data,
        refetchInterval: 30_000,
    });

    const router = useRouter();

    if (isLoading) return <DashboardSkeleton />;
    if (!data) return null;

    const stats = [
        { label: "Projets",  value: data.totalProjects, icon: FolderOpen, color: "text-blue-500",   bg: "bg-blue-500/10",   href: "/projects" },
        { label: "Idées",    value: data.totalIdeas,    icon: Lightbulb,  color: "text-yellow-500", bg: "bg-yellow-500/10", href: "/ideas" },
        { label: "Scripts",  value: data.totalScripts,  icon: FileText,   color: "text-green-500",  bg: "bg-green-500/10",  href: "/scripts" },
        { label: "Titres",   value: data.totalTitles,   icon: Type,       color: "text-purple-500", bg: "bg-purple-500/10", href: "/titles" },
    ];

    const quotas = [
        { label: "Idées",   quota: data.ideaQuota,   icon: Lightbulb, color: "bg-yellow-500" },
        { label: "Scripts", quota: data.scriptQuota, icon: FileText,  color: "bg-green-500" },
        { label: "Titres",  quota: data.titleQuota,  icon: Type,      color: "bg-purple-500" },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">

            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Votre activité créative en un coup d&apos;œil
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className={`gap-1.5 px-3 py-1 text-sm ${planColors[data.currentPlan]}`}
                >
                    <Zap className="w-3.5 h-3.5" />
                    Plan {data.currentPlan}
                </Badge>
            </motion.div>

            {/* Stats cards */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                        onClick={() => router.push(stat.href)}
                    >
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-3xl font-bold mb-0.5">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Quotas du jour */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="border-border/50 h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Quotas du jour
                                {data.currentPlan === "FREE" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-auto text-xs h-7"
                                        onClick={() => router.push("/subscription")}
                                    >
                                        Passer Pro
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {quotas.map((q) => {
                                const isUnlimited = q.quota.unlimited;
                                return (
                                    <div key={q.label}>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <div className="flex items-center gap-2">
                                                <q.icon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{q.label}</span>
                                            </div>
                                            <span className="text-muted-foreground text-xs">
                        {isUnlimited
                            ? <Badge variant="secondary" className="text-xs">Illimité ✨</Badge>
                            : `${q.quota.used} / ${q.quota.limit} utilisés`
                        }
                      </span>
                                        </div>
                                        {!isUnlimited && (
                                            <div className="space-y-1">
                                                <Progress
                                                    value={q.quota.percentage}
                                                    className="h-2"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{q.quota.remaining} restants</span>
                                                    <span>{q.quota.percentage}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {data.planExpiresAt && data.currentPlan !== "FREE" && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        Renouvellement : {data.planExpiresAt}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Projets récents */}
                <motion.div variants={item}>
                    <Card className="border-border/50 h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-primary" />
                                Projets récents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.recentProjects.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground text-xs mb-3">Aucun projet</p>
                                    <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
                                        Créer un projet
                                    </Button>
                                </div>
                            ) : (
                                data.recentProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                        className="flex items-center justify-between p-3 rounded-lg
                               bg-accent/40 hover:bg-accent transition-colors cursor-pointer"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">{project.platform}</p>
                                        </div>
                                        <div className="flex gap-2 text-xs text-muted-foreground flex-shrink-0 ml-2">
                      <span className="flex items-center gap-0.5">
                        <Lightbulb className="w-3 h-3" />{project.ideaCount}
                      </span>
                                            <span className="flex items-center gap-0.5">
                        <FileText className="w-3 h-3" />{project.scriptCount}
                      </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {data.recentProjects.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs mt-1"
                                    onClick={() => router.push("/projects")}
                                >
                                    Voir tous les projets
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Activité récente */}
            {data.recentActivities.length > 0 && (
                <motion.div variants={item}>
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Activité récente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.recentActivities.map((activity, i) => {
                                const config = activityTypeConfig[activity.type as keyof typeof activityTypeConfig]
                                    ?? activityTypeConfig.SCRIPT;
                                const Icon = config.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground">{activity.projectName}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                      {activity.createdAt}
                    </span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 max-w-5xl">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Skeleton className="h-56 rounded-xl lg:col-span-2" />
                <Skeleton className="h-56 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
        </div>
    );
}