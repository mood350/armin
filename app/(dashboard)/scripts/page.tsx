"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FileText, Sparkles, Loader2, Clock,
    Hash, Wand2, Trash2, Search, Eye
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
import { Script, Project, ScriptTone } from "@/types";
import { useRouter } from "next/navigation";

const tones: { value: ScriptTone; label: string; emoji: string }[] = [
    { value: "EDUCATIF",        label: "Éducatif",        emoji: "🎓" },
    { value: "HUMORISTIQUE",    label: "Humoristique",    emoji: "😄" },
    { value: "INSPIRANT",       label: "Inspirant",       emoji: "✨" },
    { value: "PROFESSIONNEL",   label: "Professionnel",   emoji: "💼" },
    { value: "CONVERSATIONNEL", label: "Conversationnel", emoji: "💬" },
    { value: "DRAMATIQUE",      label: "Dramatique",      emoji: "🎭" },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ScriptsPage() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterProject, setFilterProject] = useState<string>("ALL");
    const [projectId, setProjectId] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTone, setSelectedTone] = useState<ScriptTone>("EDUCATIF");
    const [title, setTitle] = useState("");
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => (await api.get("/api/projects")).data,
    });

    // Charger les scripts de TOUS les projets en parallèle
    const scriptsQuery = useQuery<Script[]>({
        queryKey: ["scripts-all", projects.map(p => p.id)],
        queryFn: async () => {
            if (projects.length === 0) return [];
            const results = await Promise.all(
                projects.map(p => api.get(`/api/scripts/project/${p.id}`).then(r => r.data as Script[]))
            );
            return results.flat();
        },
        enabled: projects.length > 0,
    });

    const allScripts = scriptsQuery.data ?? [];
    const isLoading = scriptsQuery.isLoading;

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/api/scripts/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["scripts-all"] });
            toast.success("Script supprimé");
        },
    });

    const handleGenerate = async () => {
        if (!projectId || !title) {
            toast.error("Choisissez un projet et entrez un titre");
            return;
        }
        setIsGenerating(true);
        try {
            await api.post("/api/scripts/generate", {
                projectId: Number(projectId),
                title,
                tone: selectedTone,
            });
            toast.success("Script généré !");
            setOpen(false);
            setTitle("");
            void queryClient.invalidateQueries({ queryKey: ["scripts-all"] });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    const filtered = allScripts.filter((s) => {
        const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
        const matchProject = filterProject === "ALL" || String(s.id) === filterProject;
        return matchSearch && matchProject;
    });

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Scripts</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {allScripts.length} script{allScripts.length > 1 ? "s" : ""} au total
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Sparkles className="w-4 h-4" /> Nouveau script</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Générer un script
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
                                <Label>Titre du contenu</Label>
                                <Input placeholder="Ex: Les 5 outils IA indispensables en 2025" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ton</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {tones.map((t) => (
                                        <button key={t.value} type="button" onClick={() => setSelectedTone(t.value)}
                                                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all duration-150
                                                ${selectedTone === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}>
                                            <span className="text-base">{t.emoji}</span>
                                            <span className="font-medium">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleGenerate} className="w-full gap-2" disabled={isGenerating}>
                                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération (~30s)...</> : <><Sparkles className="w-4 h-4" /> Générer le script</>}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

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

            {/* Scripts list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">
                        {allScripts.length === 0 ? "Aucun script généré pour l'instant" : "Aucun résultat pour ces filtres"}
                    </p>
                    {allScripts.length === 0 && (
                        <Button onClick={() => setOpen(true)} className="gap-2"><Sparkles className="w-4 h-4" /> Générer un script</Button>
                    )}
                </div>
            ) : (
                <motion.div variants={container} className="space-y-3">
                    {filtered.map((script) => {
                        const project = projects.find(p => p.id === script.id);
                        return (
                            <motion.div key={script.id} variants={item}
                                        className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all duration-150">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <Badge variant="secondary" className="text-xs">
                                                {tones.find(t => t.value === script.tone)?.emoji}{" "}
                                                {tones.find(t => t.value === script.tone)?.label}
                                            </Badge>
                                            {project && <Badge variant="outline" className="text-xs">{project.name}</Badge>}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {script.estimatedDuration}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Hash className="w-3 h-3" /> {script.wordCount} mots
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1 truncate">{script.title}</h3>
                                        <p className="text-muted-foreground text-xs line-clamp-2">
                                            {script.content?.slice(0, 120)}...
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => router.push(`/scripts/${script.id}`)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => router.push(`/scripts/${script.id}?improve=true`)}>
                                            <Wand2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => deleteMutation.mutate(script.id)}>
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