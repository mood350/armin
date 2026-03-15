"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2, Send, TwitterIcon, LinkedinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    message: z.string().min(10, "Message trop court (min. 10 caractères)"),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactModalProps {
    open: boolean;
    onClose: () => void;
}

export function ContactModal({ open, onClose }: ContactModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactForm>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactForm) => {
        setIsLoading(true);
        try {
            const mailtoLink = `mailto:contact@armin.ai?subject=Contact de ${data.name}&body=${encodeURIComponent(
                `Nom: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
            )}`;
            window.open(mailtoLink);
            toast.success("Votre message a été préparé !");
            reset();
            onClose();
        } catch {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
                    >
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">Nous contacter</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        On vous répond sous 24h
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center
                                               text-muted-foreground hover:text-foreground
                                               hover:bg-accent transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@exemple.com"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        placeholder="Votre message..."
                                        {...register("message")}
                                        className={`w-full rounded-md border px-3 py-2 text-sm
                                                    bg-background resize-none outline-none
                                                    focus:ring-2 focus:ring-ring transition-colors
                                                    ${errors.message ? "border-destructive" : "border-input"}`}
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-destructive">
                                            {errors.message.message}
                                        </p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Envoyer le message
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Séparateur */}
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">ou</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* Réseaux sociaux */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Balise <a> corrigée */}
                                <a
                                    href="https://twitter.com/armin_ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full gap-2" size="sm">
                                        <TwitterIcon className="w-4 h-4" />
                                        Twitter / X
                                    </Button>
                                </a>

                                {/* Balise <a> corrigée */}
                                <a
                                    href="https://linkedin.com/company/armin-ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full gap-2" size="sm">
                                        <LinkedinIcon className="w-4 h-4" />
                                        LinkedIn
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}