"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Platform } from "@/types";

const platforms: { value: Platform; label: string; emoji: string }[] = [
    { value: "YOUTUBE",   label: "YouTube",   emoji: "📺" },
    { value: "TIKTOK",    label: "TikTok",    emoji: "🎵" },
    { value: "INSTAGRAM", label: "Instagram", emoji: "📸" },
    { value: "LINKEDIN",  label: "LinkedIn",  emoji: "💼" },
    { value: "BLOG",      label: "Blog",      emoji: "✍️" },
    { value: "PODCAST",   label: "Podcast",   emoji: "🎙️" },
];

const schema = z.object({
    name:        z.string().min(2, "Nom requis (min. 2 caractères)"),
    description: z.string().optional(),
    platform:    z.enum(["YOUTUBE","TIKTOK","INSTAGRAM","LINKEDIN","BLOG","PODCAST"]),
    niche:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            await api.post("/api/projects", data);
            toast.success("Projet créé !");
            onSuccess();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Erreur lors de la création");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Plateforme */}
            <div className="space-y-2">
                <Label>Plateforme</Label>
                <div className="grid grid-cols-3 gap-2">
                    {platforms.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => {
                                setSelectedPlatform(p.value);
                                setValue("platform", p.value);
                            }}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm
                         transition-all duration-150
                         ${selectedPlatform === p.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 text-muted-foreground"
                            }`}
                        >
                            <span className="text-lg">{p.emoji}</span>
                            <span className="font-medium">{p.label}</span>
                        </button>
                    ))}
                </div>
                {errors.platform && (
                    <p className="text-xs text-destructive">Choisissez une plateforme</p>
                )}
            </div>

            {/* Nom */}
            <div className="space-y-2">
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                    id="name"
                    placeholder="Ex: Chaîne tech pour débutants"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
            </div>

            {/* Niche */}
            <div className="space-y-2">
                <Label htmlFor="niche">
                    Niche <span className="text-muted-foreground">(optionnel)</span>
                </Label>
                <Input
                    id="niche"
                    placeholder="Ex: Technologie, Finance, Cuisine..."
                    {...register("niche")}
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">
                    Description <span className="text-muted-foreground">(optionnel)</span>
                </Label>
                <Input
                    id="description"
                    placeholder="Décrivez l'objectif de ce projet..."
                    {...register("description")}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                    </>
                ) : (
                    "Créer le projet"
                )}
            </Button>
        </form>
    );
}