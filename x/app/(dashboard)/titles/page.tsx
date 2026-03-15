"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Type, Sparkles, Loader2, Star,
    StarOff, Trash2, Search, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Title, Project, Platform } from "@/types";

const platforms: Platform[] = ["YOUTUBE","TIKTOK","INSTAGRAM","LINKEDIN","BLOG","PODCAST"];

const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
};

const scoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function TitlesPage() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterProject, setFilterProject] = useState<string>("ALL");
    const [projectId, setProjectId] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [subject, setSubject] = useState("");
    const [keywords, setKeywords] = useState("");
    const [platform, setPlatform] = useState<Platform>("YOUTUBE");
    const [count, setCount] = useState("10");
    const queryClient = useQueryClient();

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => (await api.get("/api/projects")).data,
    });

    // Charger les titres de TOUS les projets en parallèle
    const titlesQuery = useQuery<Title[]>({
        queryKey: ["titles-all", projects.map(p => p.id)],
        queryFn: async () => {
            if (projects.length === 0) return [];
            const results = await Promise.all(
                projects.map(p => api.get(`/api/titles/project/${p.id}`).then(r => r.data as Title[]))
            );
            return results.flat();
        },
        enabled: projects.length > 0,
    });

    const allTitles = titlesQuery.data ?? [];
    const isLoading = titlesQuery.isLoading;

    const selectMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/api/titles/${id}/select`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["titles-all"] });
            toast.success("Titre sélectionné !");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/api/titles/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["titles-all"] });
            toast.success("Titre supprimé");
        },
    });

    const handleGenerate = async () => {
        if (!projectId || !subject) {
            toast.error("Choisissez un projet et entrez un sujet");
            return;
        }
        setIsGenerating(true);
        try {
            await api.post("/api/titles/generate", {
                projectId: Number(projectId),
                subject, keywords, platform,
                count: Number(count),
            });
            toast.success(`${count} titres générés !`);
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["titles-all"] });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    const filtered = allTitles.filter((t) => {
        const matchSearch = t.content.toLowerCase().includes(search.toLowerCase());
        const matchProject = filterProject === "ALL" || String(t.id) === filterProject;
        return matchSearch && matchProject;
    });

    const selectedTitle = allTitles.find((t) => t.selected);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Titres</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {allTitles.length} titre{allTitles.length > 1 ? "s" : ""} au total
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Sparkles className="w-4 h-4" /> Générer des titres</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Générer des titres
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Projet</Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un projet..." /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sujet</Label>
                                <Input placeholder="Ex: Les meilleurs outils IA de 2025" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Mots-clés SEO <span className="text-muted-foreground">(optionnel)</span></Label>
                                <Input placeholder="Ex: IA, outils, productivité" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Plateforme</Label>
                                    <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {platforms.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Select value={count} onValueChange={setCount}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["5","10"].map((n) => (<SelectItem key={n} value={n}>{n} titres</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleGenerate} className="w-full gap-2" disabled={isGenerating}>
                                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Sparkles className="w-4 h-4" /> Générer</>}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Titre sélectionné */}
            {selectedTitle && (
                <motion.div variants={item} className="p-4 rounded-xl border border-primary/50 bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-xs font-medium text-primary">Titre sélectionné</span>
                    </div>
                    <p className="font-semibold">{selectedTitle.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedTitle.platformLimit}</p>
                </motion.div>
            )}

            {/* Filters */}
            <motion.div variants={item} className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tous les projets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les projets</SelectItem>
                        {projects.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Titles list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Type className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">
                        {allTitles.length === 0 ? "Aucun titre généré pour l'instant" : "Aucun résultat pour ces filtres"}
                    </p>
                    {allTitles.length === 0 && (
                        <Button onClick={() => setOpen(true)} className="gap-2"><Sparkles className="w-4 h-4" /> Générer des titres</Button>
                    )}
                </div>
            ) : (
                <motion.div variants={container} className="space-y-2">
                    {filtered.map((title) => {
                        const project = projects.find(p => p.id === title.id);
                        return (
                            <motion.div key={title.id} variants={item}
                                        className={`group bg-card border rounded-xl p-4 transition-all duration-150
                                    ${title.selected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40"}`}>
                                <div className="flex items-start gap-4">
                                    {/* Score */}
                                    <div className="flex-shrink-0 text-center w-12">
                                        <div className={`text-lg font-bold ${scoreColor(title.engagementScore)}`}>
                                            {title.engagementScore}
                                        </div>
                                        <div className="text-xs text-muted-foreground">score</div>
                                        <div className={`h-1 rounded-full mt-1 ${scoreBarColor(title.engagementScore)}`}
                                             style={{ width: `${title.engagementScore}%`, maxWidth: "100%" }} />
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm mb-1">{title.content}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> {title.characterCount} car.
                                            </span>
                                            <span className={title.platformLimit?.startsWith("✅") ? "text-green-500" : "text-amber-500"}>
                                                {title.platformLimit}
                                            </span>
                                            {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
                                        </div>
                                        {title.keywords && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {title.keywords.split(",").slice(0, 3).map((kw) => (
                                                    <Badge key={kw} variant="outline" className="text-xs px-1.5 py-0">{kw.trim()}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button variant="ghost" size="icon"
                                                className={`w-8 h-8 ${title.selected ? "text-primary" : "opacity-0 group-hover:opacity-100"}`}
                                                onClick={() => selectMutation.mutate(title.id)}>
                                            {title.selected
                                                ? <Star className="w-4 h-4 fill-primary text-primary" />
                                                : <StarOff className="w-4 h-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon"
                                                className="w-8 h-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteMutation.mutate(title.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}