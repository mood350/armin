"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FolderOpen, Plus, YoutubeIcon, Music2, InstagramIcon,
    LinkedinIcon, BookOpen, Mic, MoreVertical, Archive,
    Trash2, Users, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { Project, Platform } from "@/types";
import { ProjectForm } from "@/components/projects/project-form";
import { useRouter } from "next/navigation";

const platformConfig: Record<Platform, { icon: React.ElementType; color: string; label: string }> = {
    YOUTUBE:   { icon: YoutubeIcon,    color: "text-red-500",    label: "YouTube" },
    TIKTOK:    { icon: Music2,     color: "text-pink-500",   label: "TikTok" },
    INSTAGRAM: { icon: InstagramIcon,  color: "text-purple-500", label: "Instagram" },
    LINKEDIN:  { icon: LinkedinIcon,   color: "text-blue-500",   label: "LinkedIn" },
    BLOG:      { icon: BookOpen,   color: "text-green-500",  label: "Blog" },
    PODCAST:   { icon: Mic,        color: "text-orange-500", label: "Podcast" },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

export default function ProjectsPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await api.get("/api/projects");
            return res.data;
        },
    });

    const archiveMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/api/projects/${id}/archive`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Projet archivé");
        },
        onError: () => toast.error("Erreur lors de l'archivage"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/api/projects/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Projet supprimé");
        },
        onError: () => toast.error("Erreur lors de la suppression"),
    });

    const filtered = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.niche?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Projets</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {projects.length} projet{projects.length > 1 ? "s" : ""} actif{projects.length > 1 ? "s" : ""}
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nouveau projet
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Créer un projet</DialogTitle>
                        </DialogHeader>
                        <ProjectForm onSuccess={() => {
                            setOpen(false);
                            queryClient.invalidateQueries({ queryKey: ["projects"] });
                        }} />
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Search */}
            <motion.div variants={item} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un projet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </motion.div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-44 rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState onCreateClick={() => setOpen(true)} />
            ) : (
                <motion.div
                    variants={container}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filtered.map((project) => {
                        const config = platformConfig[project.platform];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={project.id}
                                variants={item}
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className="group relative bg-card border border-border rounded-xl p-5
                           hover:border-primary/50 hover:shadow-md transition-all
                           duration-200 cursor-pointer"
                            >
                                {/* Platform badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`flex items-center gap-2 text-sm font-medium ${config.color}`}>
                                        <Icon className="w-4 h-4" />
                                        {config.label}
                                    </div>

                                    {/* Actions menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    archiveMutation.mutate(project.id);
                                                }}
                                            >
                                                <Archive className="w-4 h-4 mr-2" />
                                                Archiver
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMutation.mutate(project.id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Name */}
                                <h3 className="font-semibold text-base mb-1 truncate">
                                    {project.name}
                                </h3>

                                {/* Description */}
                                {project.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {project.description}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/50">
                                    {project.niche && (
                                        <Badge variant="secondary" className="text-xs">
                                            {project.niche}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Users className="w-3 h-3" />
                                        {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
        >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Aucun projet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Créez votre premier projet pour commencer à générer des idées, scripts et titres.
            </p>
            <Button onClick={onCreateClick} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer mon premier projet
            </Button>
        </motion.div>
    );
}