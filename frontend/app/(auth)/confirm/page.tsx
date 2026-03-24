"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // ✅
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ConfirmPage() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        if (!token || token.length !== 6) {
            toast.error("Entrez le code à 6 chiffres reçu par email."); // ✅
            return;
        }

        setIsLoading(true);
        try {
            await api.get(`/auth/confirm?token=${token}`);
            toast.success("Compte activé ! Vous pouvez vous connecter."); // ✅
            router.push("/login");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Code invalide ou expiré"); // ✅
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold">Armin</span>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-xl font-semibold mb-2">
                        Vérifiez votre email
                    </h1>
                    <p className="text-muted-foreground text-sm mb-6">
                        Entrez le code à 6 chiffres envoyé à votre adresse email.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <Label>Code de confirmation</Label>
                            <Input
                                placeholder="123456"
                                maxLength={6}
                                value={token}
                                onChange={(e) =>
                                    setToken(e.target.value.replace(/\D/g, ""))
                                }
                                className="text-center text-2xl tracking-widest font-mono h-14"
                            />
                        </div>

                        <Button
                            onClick={handleConfirm}
                            className="w-full"
                            disabled={isLoading || token.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                "Confirmer mon compte"
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}