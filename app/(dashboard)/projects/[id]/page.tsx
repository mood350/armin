"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Lightbulb, FileText, Type,
    YoutubeIcon, Music2, InstagramIcon, LinkedinIcon, BookOpen, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { Project, Platform } from "@/types";

const platformConfig: Record<Platform, { icon: React.ElementType; color: string; label: string }> = {
    YOUTUBE:   { icon: YoutubeIcon,   color: "text-red-500",    label: "YouTube" },
    TIKTOK:    { icon: Music2,    color: "text-pink-500",   label: "TikTok" },
    INSTAGRAM: { icon: InstagramIcon, color: "text-purple-500", label: "Instagram" },
    LINKEDIN:  { icon: LinkedinIcon,  color: "text-blue-500",   label: "LinkedIn" },
    BLOG:      { icon: BookOpen,  color: "text-green-500",  label: "Blog" },
    PODCAST:   { icon: Mic,       color: "text-orange-500", label: "Podcast" },
};

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: project, isLoading } = useQuery<Project>({
        queryKey: ["project", id],
        queryFn: async () => {
            const res = await api.get(`/api/projects/${id}`);
            return res.data;
        },
    });

    if (isLoading) return <ProjectDetailSkeleton />;
    if (!project) return null;

    const config = platformConfig[project.platform];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                    </div>
                    <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                    {project.description && (
                        <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                    )}
                </div>
                {project.niche && (
                    <Badge variant="secondary">{project.niche}</Badge>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ideas">
                <TabsList className="grid grid-cols-3 w-full max-w-sm">
                    <TabsTrigger value="ideas" className="gap-2">
                        <Lightbulb className="w-4 h-4" /> Idées
                    </TabsTrigger>
                    <TabsTrigger value="scripts" className="gap-2">
                        <FileText className="w-4 h-4" /> Scripts
                    </TabsTrigger>
                    <TabsTrigger value="titles" className="gap-2">
                        <Type className="w-4 h-4" /> Titres
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ideas" className="mt-6">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Lightbulb className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">
                            Allez dans <strong>Idées</strong> pour générer du contenu pour ce projet.
                        </p>
                        <Button
                            className="mt-4 gap-2"
                            onClick={() => router.push("/ideas")}
                        >
                            <Lightbulb className="w-4 h-4" />
                            Générer des idées
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="scripts" className="mt-6">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">
                            Aucun script pour ce projet.
                        </p>
                        <Button
                            className="mt-4 gap-2"
                            onClick={() => router.push("/scripts")}
                        >
                            <FileText className="w-4 h-4" />
                            Créer un script
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="titles" className="mt-6">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Type className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">
                            Aucun titre optimisé pour ce projet.
                        </p>
                        <Button
                            className="mt-4 gap-2"
                            onClick={() => router.push("/titles")}
                        >
                            <Type className="w-4 h-4" />
                            Générer des titres
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}

function ProjectDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-48" />
        </div>
    );
}