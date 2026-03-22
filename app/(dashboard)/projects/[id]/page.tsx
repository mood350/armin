"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Lightbulb, FileText, Type,
    YoutubeIcon, Music2, InstagramIcon, LinkedinIcon, BookOpen, Mic,
    Sparkles, Plus, Users, Trash2, Star, Clock, Hash,
    ArrowRight, XCircle, CheckCircle2, Loader2, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { Project, Platform, Idea, Script, Title, IdeaStatus, ScriptTone } from "@/types";

const platformConfig: Record<Platform, { icon: React.ElementType; color: string; label: string }> = {
    YOUTUBE:   { icon: YoutubeIcon,   color: "text-red-500",    label: "YouTube" },
    TIKTOK:    { icon: Music2,        color: "text-pink-500",   label: "TikTok" },
    INSTAGRAM: { icon: InstagramIcon, color: "text-purple-500", label: "Instagram" },
    LINKEDIN:  { icon: LinkedinIcon,  color: "text-blue-500",   label: "LinkedIn" },
    BLOG:      { icon: BookOpen,      color: "text-green-500",  label: "Blog" },
    PODCAST:   { icon: Mic,           color: "text-orange-500", label: "Podcast" },
};

const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
    SAVED:     { label: "Sauvegardée",  color: "bg-blue-500/10 text-blue-500" },
    CONVERTED: { label: "Convertie",    color: "bg-green-500/10 text-green-500" },
    REJECTED:  { label: "Rejetée",      color: "bg-red-500/10 text-red-500" },
};

const tones: { value: ScriptTone; label: string; emoji: string }[] = [
    { value: "EDUCATIF",        label: "Éducatif",        emoji: "🎓" },
    { value: "HUMORISTIQUE",    label: "Humoristique",    emoji: "😄" },
    { value: "INSPIRANT",       label: "Inspirant",       emoji: "✨" },
    { value: "PROFESSIONNEL",   label: "Professionnel",   emoji: "💼" },
    { value: "CONVERSATIONNEL", label: "Conversationnel", emoji: "💬" },
    { value: "DRAMATIQUE",      label: "Dramatique",      emoji: "🎭" },
];

interface Collaborator {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [scriptTone, setScriptTone] = useState<ScriptTone>("EDUCATIF");
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [collabEmail, setCollabEmail] = useState("");
    const [isAddingCollab, setIsAddingCollab] = useState(false);

    const { data: project, isLoading: projectLoading } = useQuery<Project>({
        queryKey: ["project", id],
        queryFn: async () => (await api.get(`/api/projects/${id}`)).data,
    });

    const { data: ideas = [] } = useQuery<Idea[]>({
        queryKey: ["ideas", id],
        queryFn: async () => (await api.get(`/api/ideas/project/${id}`)).data,
    });

    const { data: scripts = [] } = useQuery<Script[]>({
        queryKey: ["scripts", id],
        queryFn: async () => (await api.get(`/api/scripts/project/${id}`)).data,
    });

    const { data: titles = [] } = useQuery<Title[]>({
        queryKey: ["titles", id],
        queryFn: async () => (await api.get(`/api/titles/project/${id}`)).data,
    });

    const { data: collaborators = [] } = useQuery<Collaborator[]>({
        queryKey: ["collaborators", id],
        queryFn: async () => {
            try {
                return (await api.get(`/api/projects/${id}/collaborators`)).data;
            } catch {
                return [];
            }
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ ideaId, status }: { ideaId: number; status: IdeaStatus }) =>
            api.patch(`/api/ideas/${ideaId}/status?status=${status}`),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ideas", id] }),
    });

    const deleteScriptMutation = useMutation({
        mutationFn: (scriptId: number) => api.delete(`/api/scripts/${scriptId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["scripts", id] });
            toast.success("Script supprimé");
        },
    });

    const selectTitleMutation = useMutation({
        mutationFn: (titleId: number) => api.patch(`/api/titles/${titleId}/select`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["titles", id] });
            toast.success("Titre sélectionné !");
        },
    });

    // FIX: email dans le body JSON (pas query param), mutation prend string email
    const removeCollabMutation = useMutation({
        mutationFn: (email: string) =>
            api.delete(`/api/projects/${id}/collaborators`, {
                data: { email },
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["collaborators", id] });
            toast.success("Collaborateur retiré");
        },
        onError: () => toast.error("Erreur lors de la suppression"),
    });

    const handleGenerateScript = async () => {
        if (!selectedIdea) return;
        setIsGeneratingScript(true);
        try {
            const res = await api.post("/api/scripts/generate", {
                projectId: Number(id),
                title: selectedIdea.title,
                tone: scriptTone,
                ideaId: selectedIdea.id,
            });
            statusMutation.mutate({ ideaId: selectedIdea.id, status: "CONVERTED" });
            toast.success("Script généré !");
            setScriptDialogOpen(false);
            router.push(`/scripts/${res.data.id}`);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    // FIX: email dans body JSON { email: ... }
    const handleAddCollaborator = async () => {
        if (!collabEmail.trim()) return;
        setIsAddingCollab(true);
        try {
            await api.post(`/api/projects/${id}/collaborators`, {
                email: collabEmail.trim(),
            });
            toast.success("Collaborateur ajouté !");
            setCollabEmail("");
            void queryClient.invalidateQueries({ queryKey: ["collaborators", id] });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
        } finally {
            setIsAddingCollab(false);
        }
    };

    if (projectLoading) return <ProjectDetailSkeleton />;
    if (!project) return null;

    const config = platformConfig[project.platform];
    const Icon = config.icon;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 text-sm font-medium mb-1 ${config.color}`}>
                        <Icon className="w-4 h-4" /> {config.label}
                    </div>
                    <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                    {project.description && (
                        <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                    )}
                </div>
                {project.niche && <Badge variant="secondary">{project.niche}</Badge>}
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Idées",   count: ideas.length,   icon: Lightbulb, color: "text-blue-500" },
                    { label: "Scripts", count: scripts.length, icon: FileText,  color: "text-green-500" },
                    { label: "Titres",  count: titles.length,  icon: Type,      color: "text-purple-500" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                        <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Dialog: créer script depuis idée */}
            <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
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

            {/* Tabs */}
            <Tabs defaultValue="ideas">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="ideas" className="gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> Idées ({ideas.length})
                    </TabsTrigger>
                    <TabsTrigger value="scripts" className="gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Scripts ({scripts.length})
                    </TabsTrigger>
                    <TabsTrigger value="titles" className="gap-1.5">
                        <Type className="w-3.5 h-3.5" /> Titres ({titles.length})
                    </TabsTrigger>
                    <TabsTrigger value="collaborators" className="gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Équipe ({collaborators.length})
                    </TabsTrigger>
                </TabsList>

                {/* IDEAS TAB */}
                <TabsContent value="ideas" className="mt-4 space-y-3">
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-2" onClick={() => router.push(`/ideas?projectId=${id}`)}>
                            <Sparkles className="w-3.5 h-3.5" /> Générer des idées
                        </Button>
                    </div>
                    {ideas.length === 0 ? (
                        <EmptyTab icon={Lightbulb} label="Aucune idée pour ce projet" />
                    ) : ideas.map((idea) => (
                        <div key={idea.id}
                             className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[idea.status].color}`}>
                                            {statusConfig[idea.status].label}
                                        </span>
                                        {idea.format && <Badge variant="outline" className="text-xs">{idea.format}</Badge>}
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{idea.title}</h3>
                                    {idea.description && (
                                        <p className="text-muted-foreground text-xs line-clamp-2">{idea.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {idea.status === "SAVED" && (
                                        <>
                                            <Button variant="ghost" size="icon"
                                                    className="w-8 h-8 text-green-500 hover:bg-green-500/10"
                                                    title="Créer un script"
                                                    onClick={() => { setSelectedIdea(idea); setScriptDialogOpen(true); }}>
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon"
                                                    className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => statusMutation.mutate({ ideaId: idea.id, status: "REJECTED" })}>
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    {idea.status === "REJECTED" && (
                                        <Button variant="ghost" size="icon"
                                                className="w-8 h-8 text-blue-500 hover:bg-blue-500/10"
                                                onClick={() => statusMutation.mutate({ ideaId: idea.id, status: "SAVED" })}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* SCRIPTS TAB */}
                <TabsContent value="scripts" className="mt-4 space-y-3">
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-2" onClick={() => router.push("/scripts")}>
                            <Plus className="w-3.5 h-3.5" /> Nouveau script
                        </Button>
                    </div>
                    {scripts.length === 0 ? (
                        <EmptyTab icon={FileText} label="Aucun script pour ce projet" />
                    ) : scripts.map((script) => (
                        <div key={script.id}
                             className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all cursor-pointer"
                             onClick={() => router.push(`/scripts/${script.id}`)}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Badge variant="secondary" className="text-xs">
                                            {tones.find(t => t.value === script.tone)?.emoji}{" "}
                                            {tones.find(t => t.value === script.tone)?.label}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {script.estimatedDuration}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> {script.wordCount} mots
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">{script.title}</h3>
                                </div>
                                <Button variant="ghost" size="icon"
                                        className="w-8 h-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => { e.stopPropagation(); deleteScriptMutation.mutate(script.id); }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* TITLES TAB */}
                <TabsContent value="titles" className="mt-4 space-y-2">
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-2" onClick={() => router.push("/titles")}>
                            <Sparkles className="w-3.5 h-3.5" /> Générer des titres
                        </Button>
                    </div>
                    {titles.length === 0 ? (
                        <EmptyTab icon={Type} label="Aucun titre pour ce projet" />
                    ) : titles.map((title) => (
                        <div key={title.id}
                             className={`group bg-card border rounded-xl p-4 transition-all
                                ${title.selected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 text-center w-10">
                                    <div className={`text-base font-bold ${title.engagementScore >= 80 ? "text-green-500" : title.engagementScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                                        {title.engagementScore}
                                    </div>
                                    <div className="text-xs text-muted-foreground">score</div>
                                </div>
                                <p className="flex-1 font-medium text-sm">{title.content}</p>
                                <Button variant="ghost" size="icon"
                                        className={`w-8 h-8 flex-shrink-0 ${title.selected ? "text-primary" : "opacity-0 group-hover:opacity-100"}`}
                                        onClick={() => selectTitleMutation.mutate(title.id)}>
                                    <Star className={`w-4 h-4 ${title.selected ? "fill-primary" : ""}`} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* COLLABORATORS TAB */}
                <TabsContent value="collaborators" className="mt-4 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Email du collaborateur..."
                                value={collabEmail}
                                onChange={(e) => setCollabEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={handleAddCollaborator}
                                disabled={isAddingCollab || !collabEmail.trim()}
                                className="gap-2">
                            {isAddingCollab
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Plus className="w-4 h-4" />}
                            Ajouter
                        </Button>
                    </div>

                    {collaborators.length === 0 ? (
                        <EmptyTab icon={Users} label="Aucun collaborateur sur ce projet" />
                    ) : (
                        <div className="space-y-2">
                            {collaborators.map((collab) => (
                                <div key={collab.id}
                                     className="group flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                            {collab.firstName?.[0]?.toUpperCase() ?? collab.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{collab.firstName} {collab.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{collab.email}</p>
                                        </div>
                                    </div>
                                    {/* FIX: passe collab.email (string) pas collab.id */}
                                    <Button variant="ghost" size="icon"
                                            className="w-8 h-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeCollabMutation.mutate(collab.email)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}

function EmptyTab({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">{label}</p>
        </div>
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
            <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48" />
        </div>
    );
}