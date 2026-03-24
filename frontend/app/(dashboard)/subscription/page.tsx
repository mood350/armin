"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Check, Loader2, CreditCard,
    RefreshCw, Shield, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";
import { Subscription, SubscriptionPlan, BillingCycle } from "@/types";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const plans = [
    {
        id: "FREE" as SubscriptionPlan,
        name: "Free",
        emoji: "🌱",
        monthlyPrice: 0,
        yearlyPrice: 0,
        color: "border-zinc-500/30",
        badgeColor: "bg-zinc-500/10 text-zinc-400",
        features: [
            "3 projets actifs",
            "5 idées / jour",
            "3 scripts / jour",
            "5 titres / jour",
            "Export TXT",
            "Support communauté",
        ],
        limitations: [
            "Pas d'export PDF",
            "Pas de collaboration",
        ],
    },
    {
        id: "PRO" as SubscriptionPlan,
        name: "Pro",
        emoji: "⚡",
        monthlyPrice: 6550,
        yearlyPrice: 65000,
        color: "border-blue-500/50",
        badgeColor: "bg-blue-500/10 text-blue-400",
        popular: true,
        features: [
            "Projets illimités",
            "50 idées / jour",
            "30 scripts / jour",
            "Titres illimités",
            "Export PDF",
            "Collaboration en équipe",
            "Support prioritaire",
        ],
        limitations: [],
    },
    {
        id: "BUSINESS" as SubscriptionPlan,
        name: "Business",
        emoji: "🚀",
        monthlyPrice: 19670,
        yearlyPrice: 196700,
        color: "border-purple-500/50",
        badgeColor: "bg-purple-500/10 text-purple-400",
        features: [
            "Tout ce qui est dans Pro",
            "Idées illimitées",
            "Scripts illimités",
            "Accès modèles IA premium",
            "API access",
            "Support dédié 24/7",
            "Onboarding personnalisé",
        ],
        limitations: [],
    },
];

export default function SubscriptionPage() {
    const [billing, setBilling] = useState<BillingCycle>("MONTHLY");
    const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

    const { data: subscription, isLoading } = useQuery<Subscription>({
        queryKey: ["subscription"],
        queryFn: async () => (await api.get("/subscriptions/current")).data,
    });

    const upgradeMutation = useMutation({
        mutationFn: async ({ plan, cycle }: { plan: SubscriptionPlan; cycle: BillingCycle }) => {
            const res = await api.post(`/subscriptions/upgrade?plan=${plan}&cycle=${cycle}`);
            return res.data;
        },
        onSuccess: (data: { payment_url: string }) => {
            window.open(data.payment_url, "_blank");
            toast.success("Redirection vers la page de paiement...");
        },
        onError: () => {
            toast.error("Erreur lors de l'initialisation du paiement");
        },
        onSettled: () => setLoadingPlan(null),
    });

    const handleUpgrade = (plan: SubscriptionPlan) => {
        if (plan === "FREE") return;
        setLoadingPlan(plan);
        upgradeMutation.mutate({ plan, cycle: billing });
    };

    const formatPrice = (price: number) => {
        if (price === 0) return "Gratuit";
        return new Intl.NumberFormat("fr-FR").format(price) + " XOF";
    };

    const currentPlan = subscription?.plan ?? "FREE";

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto">

            {/* Header */}
            <motion.div variants={item}>
                <h1 className="text-2xl font-bold mb-1">Abonnement</h1>
                <p className="text-muted-foreground text-sm">
                    Choisissez le plan qui correspond à vos besoins
                </p>
            </motion.div>

            {/* Abonnement actuel */}
            {isLoading ? (
                <Skeleton className="h-24 rounded-xl" />
            ) : subscription && (
                <motion.div variants={item} className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold">Plan {currentPlan}</span>
                            <Badge variant="outline" className="text-xs">Actif</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {subscription.endDate
                                ? `Renouvellement le ${new Date(subscription.endDate).toLocaleDateString("fr-FR")}`
                                : "Pas de date d'expiration"
                            }
                        </p>
                    </div>
                    {currentPlan !== "FREE" && (
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Gérer
                        </Button>
                    )}
                </motion.div>
            )}

            {/* Toggle billing */}
            <motion.div variants={item} className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setBilling("MONTHLY")}
                    className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all
                     ${billing === "MONTHLY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Mensuel
                </button>
                <button
                    onClick={() => setBilling("YEARLY")}
                    className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-all flex items-center gap-2
                     ${billing === "YEARLY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Annuel
                    <Badge variant="secondary" className="text-xs">-20%</Badge>
                </button>
            </motion.div>

            {/* Plans — centrés */}
            <motion.div variants={item} className="flex flex-wrap justify-center gap-4">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const price = billing === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;
                    const isLoading = loadingPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border p-6 bg-card flex flex-col gap-4 w-full sm:w-72
                         ${plan.color}
                         ${plan.popular ? "shadow-lg shadow-blue-500/10" : ""}
                         ${isCurrent ? "ring-2 ring-primary" : ""}
                         `}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-500 text-white text-xs px-3">
                                        <Sparkles className="w-3 h-3 mr-1" /> Le plus populaire
                                    </Badge>
                                </div>
                            )}

                            {/* Plan header */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{plan.emoji}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.badgeColor}`}>
                                        {plan.name}
                                    </span>
                                    {isCurrent && (
                                        <Badge variant="outline" className="text-xs ml-auto">Actuel</Badge>
                                    )}
                                </div>
                                <div className="text-3xl font-bold">
                                    {formatPrice(price)}
                                </div>
                                {price > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {billing === "MONTHLY" ? "par mois" : "par an"}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Features */}
                            <ul className="space-y-2 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                                {plan.limitations.map((limit) => (
                                    <li key={limit} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center">✕</span>
                                        {limit}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                className="w-full"
                                variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                                disabled={isCurrent || plan.id === "FREE" || isLoading}
                                onClick={() => handleUpgrade(plan.id)}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirection...</>
                                ) : isCurrent ? (
                                    "Plan actuel"
                                ) : plan.id === "FREE" ? (
                                    "Gratuit"
                                ) : (
                                    `Passer à ${plan.name}`
                                )}
                            </Button>
                        </div>
                    );
                })}
            </motion.div>

            {/* Sécurité */}
            <motion.div variants={item} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                Paiement sécurisé via FedaPay — Mobile Money (MTN, Moov)
            </motion.div>
        </motion.div>
    );
}