"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Lightbulb, Sparkles, Loader2, CheckCircle2,
    XCircle, ArrowRight, Search, Filter, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Idea, IdeaStatus, Project, Platform, ScriptTone } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
    SAVED:     { label: "Sauvegardée",  color: "bg-blue-500/10 text-blue-500" },
    CONVERTED: { label: "Convertie",    color: "bg-green-500/10 text-green-500" },
    REJECTED:  { label: "Rejetée",      color: "bg-red-500/10 text-red-500" },
};

const platforms: Platform[] = ["YOUTUBE","TIKTOK","INSTAGRAM","LINKEDIN","BLOG","PODCAST"];

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

export default function IdeasPage() {
    const [open, setOpen] = useState(false);
    const [scriptOpen, setScriptOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterProject, setFilterProject] = useState<string>("ALL");
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Génération idées
    const [projectId, setProjectId] = useState("");
    const [theme, setTheme] = useState("");
    const [audience, setAudience] = useState("");
    const [platform, setPlatform] = useState<Platform>("YOUTUBE");
    const [format, setFormat] = useState("");
    const [count, setCount] = useState("5");
    const [isGenerating, setIsGenerating] = useState(false);

    // Génération script depuis idée
    const [scriptProjectId, setScriptProjectId] = useState("");
    const [scriptTone, setScriptTone] = useState<ScriptTone>("EDUCATIF");
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => (await api.get("/api/projects")).data,
    });

    const ideasQuery = useQuery<Idea[]>({
        queryKey: ["ideas-all", projects.map(p => p.id)],
        queryFn: async () => {
            if (projects.length === 0) return [];
            const results = await Promise.all(
                projects.map(p => api.get(`/api/ideas/project/${p.id}`).then(r => r.data as Idea[]))
            );
            return results.flat();
        },
        enabled: projects.length > 0,
    });

    const allIdeas = ideasQuery.data ?? [];
    const isLoading = ideasQuery.isLoading;

    // Pré-ouvrir le dialog script si ?ideaId= est dans l'URL
    useEffect(() => {
        const ideaId = searchParams.get("ideaId");
        if (ideaId && allIdeas.length > 0) {
            const idea = allIdeas.find(i => String(i.id) === ideaId);
            if (idea) {
                setSelectedIdea(idea);
                // Pré-remplir le projet de l'idée
                if (idea.projectId) setScriptProjectId(String(idea.projectId));
                setScriptOpen(true);
            }
        }
    }, [searchParams, allIdeas]);

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: IdeaStatus }) =>
            api.patch(`/api/ideas/${id}/status?status=${status}`),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ideas-all"] }),
    });

    const handleGenerate = async () => {
        if (!projectId || !theme) {
            toast.error("Choisissez un projet et entrez un thème");
            return;
        }
        setIsGenerating(true);
        try {
            await api.post("/api/ideas/generate", {
                projectId: Number(projectId),
                theme, audience, platform, format,
                count: Number(count),
            });
            toast.success(`${count} idées générées !`);
            setOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["ideas-all"] });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateScript = async () => {
        if (!selectedIdea || !scriptProjectId) {
            toast.error("Choisissez un projet");
            return;
        }
        setIsGeneratingScript(true);
        try {
            const res = await api.post("/api/scripts/generate", {
                projectId: Number(scriptProjectId),
                title: selectedIdea.title,
                tone: scriptTone,
                ideaId: selectedIdea.id,
            });
            // Marquer l'idée comme convertie
            statusMutation.mutate({ id: selectedIdea.id, status: "CONVERTED" });
            toast.success("Script généré !");
            setScriptOpen(false);
            router.push(`/scripts/${res.data.id}`);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const openScriptDialog = (idea: Idea) => {
        setSelectedIdea(idea);
        setScriptProjectId(idea.projectId ? String(idea.projectId) : "");
        setScriptOpen(true);
    };

    // FIX: filtre par projectId (pas idea.id)
    const filtered = allIdeas.filter((idea) => {
        const matchSearch = idea.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "ALL" || idea.status === filterStatus;
        const matchProject = filterProject === "ALL" || String(idea.projectId) === filterProject;
        return matchSearch && matchStatus && matchProject;
    });

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Idées</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {allIdeas.length} idée{allIdeas.length > 1 ? "s" : ""} au total
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Sparkles className="w-4 h-4" /> Générer des idées
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Générer des idées
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Projet</Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un projet..." /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Thème / Sujet</Label>
                                <Input placeholder="Ex: Intelligence Artificielle..." value={theme} onChange={(e) => setTheme(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Audience <span className="text-muted-foreground">(optionnel)</span></Label>
                                <Input placeholder="Ex: Débutants 18-35 ans" value={audience} onChange={(e) => setAudience(e.target.value)} />
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
                                            {["3","5","7","10"].map((n) => (<SelectItem key={n} value={n}>{n} idées</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Format <span className="text-muted-foreground">(optionnel)</span></Label>
                                <Input placeholder="Ex: tutoriel, shorts, vlog..." value={format} onChange={(e) => setFormat(e.target.value)} />
                            </div>
                            <Button onClick={handleGenerate} className="w-full gap-2" disabled={isGenerating}>
                                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</> : <><Sparkles className="w-4 h-4" /> Générer</>}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Dialog: Créer script depuis idée */}
            <Dialog open={scriptOpen} onOpenChange={setScriptOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Créer un script
                        </DialogTitle>
                    </DialogHeader>
                    {selectedIdea && (
                        <div className="space-y-4 pt-2">
                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Idée sélectionnée</p>
                                <p className="text-sm font-medium">{selectedIdea.title}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Projet</Label>
                                <Select value={scriptProjectId} onValueChange={setScriptProjectId}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un projet..." /></SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ton</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {tones.map((t) => (
                                        <button key={t.value} type="button" onClick={() => setScriptTone(t.value)}
                                                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all
                                                ${scriptTone === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}>
                                            <span className="text-base">{t.emoji}</span>
                                            <span className="font-medium">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleGenerateScript} className="w-full gap-2" disabled={isGeneratingScript}>
                                {isGeneratingScript
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération (~30s)...</>
                                    : <><Sparkles className="w-4 h-4" /> Générer le script</>}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Filters */}
            <motion.div variants={item} className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Tous les projets" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les projets</SelectItem>
                        {projects.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous</SelectItem>
                        <SelectItem value="SAVED">Sauvegardées</SelectItem>
                        <SelectItem value="CONVERTED">Converties</SelectItem>
                        <SelectItem value="REJECTED">Rejetées</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Ideas list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Lightbulb className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">
                        {allIdeas.length === 0 ? "Aucune idée générée pour l'instant" : "Aucun résultat pour ces filtres"}
                    </p>
                    {allIdeas.length === 0 && (
                        <Button onClick={() => setOpen(true)} className="gap-2">
                            <Sparkles className="w-4 h-4" /> Générer des idées
                        </Button>
                    )}
                </div>
            ) : (
                <motion.div variants={container} className="space-y-3">
                    {filtered.map((idea) => {
                        const project = projects.find(p => p.id === idea.projectId); // FIX
                        return (
                            <motion.div key={idea.id} variants={item}
                                        className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all duration-150">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[idea.status].color}`}>
                                                {statusConfig[idea.status].label}
                                            </span>
                                            {idea.format && <Badge variant="outline" className="text-xs">{idea.format}</Badge>}
                                            {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1">{idea.title}</h3>
                                        {idea.description && (
                                            <p className="text-muted-foreground text-xs line-clamp-2">{idea.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        {idea.status === "SAVED" && (
                                            <>
                                                {/* FIX: ouvre le dialog script directement */}
                                                <Button variant="ghost" size="icon"
                                                        className="w-8 h-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        title="Créer un script"
                                                        onClick={() => openScriptDialog(idea)}>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon"
                                                        className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                                        title="Rejeter"
                                                        onClick={() => statusMutation.mutate({ id: idea.id, status: "REJECTED" })}>
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {idea.status === "REJECTED" && (
                                            <Button variant="ghost" size="icon"
                                                    className="w-8 h-8 text-blue-500 hover:bg-blue-500/10"
                                                    title="Restaurer"
                                                    onClick={() => statusMutation.mutate({ id: idea.id, status: "SAVED" })}>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                        )}
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