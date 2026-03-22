"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // ✅ sonner uniquement
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const registerSchema = z.object({
    firstname: z.string().min(2, "Prénom requis"),
    lastname: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z
        .string()
        .min(8, "8 caractères minimum")
        .regex(/[A-Z]/, "Une majuscule requise")
        .regex(/[0-9]/, "Un chiffre requis"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    // ✅ Supprimé : const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            await api.post("/api/auth/register", data);
            toast.success("Compte créé ! Vérifiez votre email."); // ✅
            router.push("/confirm");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Une erreur est survenue"); // ✅
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold">Armin</span>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <h1 className="text-xl font-semibold text-center mb-2">
                        Créer un compte
                    </h1>
                    <p className="text-muted-foreground text-sm text-center mb-6">
                        Rejoignez des milliers de créateurs de contenu.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">Prénom</Label>
                                <Input
                                    id="firstname"
                                    placeholder="John"
                                    {...register("firstname")}
                                    className={errors.firstname ? "border-destructive" : ""}
                                />
                                {errors.firstname && (
                                    <p className="text-xs text-destructive">
                                        {errors.firstname.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Nom</Label>
                                <Input
                                    id="lastname"
                                    placeholder="Doe"
                                    {...register("lastname")}
                                    className={errors.lastname ? "border-destructive" : ""}
                                />
                                {errors.lastname && (
                                    <p className="text-xs text-destructive">
                                        {errors.lastname.message}
                                    </p>
                                )}
                            </div>
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
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min. 8 caractères"
                                {...register("password")}
                                className={errors.password ? "border-destructive" : ""}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                "Créer mon compte"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Déjà un compte ?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}