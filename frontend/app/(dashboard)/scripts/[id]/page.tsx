"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Save, Wand2, Loader2, Clock,
    Hash, History, Download, Sparkles, FileText, FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";
import { Script } from "@/types";

const improveActions = [
    { value: "REFORMULER", label: "Reformuler", emoji: "🔄" },
    { value: "ALLONGER", label: "Allonger", emoji: "📏" },
    { value: "RACCOURCIR", label: "Raccourcir", emoji: "✂️" },
    { value: "CHANGE_TONE", label: "Changer le ton", emoji: "🎭" },
];

export default function ScriptEditorPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [content, setContent] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [selectedAction, setSelectedAction] = useState("REFORMULER");
    const [isSaving, setIsSaving] = useState(false);
    const [isImproving, setIsImproving] = useState(false);

    const { data: script, isLoading } = useQuery<Script>({
        queryKey: ["script", id],
        queryFn: async () => (await api.get(`/scripts/${id}`)).data,
    });

    useEffect(() => {
        if (script?.content) {
            setContent(script.content);
        }
    }, [script]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/scripts/${id}/content`, content, {
                headers: { "Content-Type": "text/plain" },
            });
            toast.success("Script sauvegardé");
            setIsDirty(false);
            void queryClient.invalidateQueries({ queryKey: ["script", id] });
        } catch {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImprove = async () => {
        setIsImproving(true);
        try {
            const res = await api.post("/scripts/improve", {
                scriptId: Number(id),
                action: selectedAction,
            });
            setContent(res.data.content);
            setIsDirty(true);
            toast.success("Script amélioré !");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de l'amélioration");
        } finally {
            setIsImproving(false);
        }
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportTxt = async () => {
        try {
            const res = await api.get(`/export/scripts/${id}/txt`, {
                responseType: "blob",
            });
            triggerDownload(res.data, `script-${id}.txt`);
        } catch {
            toast.error("Erreur lors de l'export TXT");
        }
    };

    const handleExportPdf = async () => {
        try {
            const res = await api.get(`/export/scripts/${id}/pdf`, {
                responseType: "blob",
            });
            triggerDownload(res.data, `script-${id}.pdf`);
        } catch {
            toast.error("Erreur lors de l'export PDF");
        }
    };

    if (isLoading) return <EditorSkeleton />;
    if (!script) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col gap-4"
        >
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg truncate">{script.title}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {script.estimatedDuration}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {script.wordCount} mots
                        </span>
                        {isDirty && (
                            <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                                Non sauvegardé
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Améliorer */}
                <div className="flex items-center gap-2">
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                        <SelectTrigger className="w-44 h-9">
                            <Wand2 className="w-3.5 h-3.5 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {improveActions.map((a) => (
                                <SelectItem key={a.value} value={a.value}>
                                    {a.emoji} {a.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImprove}
                        disabled={isImproving}
                        className="gap-2"
                    >
                        {isImproving
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> IA...</>
                            : <><Sparkles className="w-3.5 h-3.5" /> Améliorer</>
                        }
                    </Button>
                </div>

                {/* Historique versions */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <History className="w-4 h-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Historique des versions</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 space-y-3">
                            {script.versions?.map((v) => (
                                <div
                                    key={v.versionNumber}
                                    className="p-3 rounded-lg border border-border hover:border-primary/50
                                     cursor-pointer transition-colors"
                                    onClick={() => {
                                        setContent(v.content);
                                        setIsDirty(true);
                                        toast.info(`Version ${v.versionNumber} restaurée`);
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            Version {v.versionNumber}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{v.changeDescription}</p>
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Export */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Download className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportTxt} className="gap-2 cursor-pointer">
                            <FileText className="w-4 h-4" />
                            Exporter en TXT
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer">
                            <FileDown className="w-4 h-4" />
                            Exporter en PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Save */}
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                    className="gap-2"
                >
                    {isSaving
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sauvegarde...</>
                        : <><Save className="w-3.5 h-3.5" /> Sauvegarder</>
                    }
                </Button>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setIsDirty(true);
                    }}
                    className="w-full h-full min-h-[60vh] p-5 rounded-xl border border-border
                             bg-card text-sm leading-relaxed resize-none
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             font-mono transition-all"
                    placeholder="Le contenu du script apparaîtra ici..."
                    spellCheck={false}
                />
            </div>
        </motion.div>
    );
}

function EditorSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-[60vh] rounded-xl" />
        </div>
    );
}