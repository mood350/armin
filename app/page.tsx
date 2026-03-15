// app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Lightbulb, FileText, Type,
  ArrowRight, Check, Zap, Users, TrendingUp,
  ChevronRight, Star, Youtube, Music2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

        {/* ── NAVBAR ─────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50
                      bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Armin</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="hover:text-foreground transition-colors">
                Tarifs
              </a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">
                Témoignages
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1">
                  Commencer <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6">
          <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={item}>
              <Badge variant="outline" className="mb-6 gap-1.5 px-4 py-1.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                Propulsé par Gemini & Groq
              </Badge>
            </motion.div>

            <motion.h1
                variants={item}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
            >
              Votre co-pilote
              <span className="text-primary"> créatif</span>
              <br />alimenté par l&apos;IA
            </motion.h1>

            <motion.p
                variants={item}
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Armin génère vos idées, scripts et titres optimisés pour YouTube,
              TikTok, Instagram et plus. Créez plus, en moins de temps.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base h-12 px-8">
                Voir la démo
              </Button>
            </motion.div>

            <motion.p variants={item} className="text-sm text-muted-foreground mt-4">
              Gratuit pour toujours · Pas de carte bancaire
            </motion.p>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 20 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-5xl mx-auto mt-16"
          >
            <div className="relative rounded-2xl border border-border/50 bg-card
                          shadow-2xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-md bg-muted/50 flex
                              items-center px-3 text-xs text-muted-foreground">
                  app.armin.ai/dashboard
                </div>
              </div>

              {/* Fake dashboard */}
              <div className="p-6 bg-background min-h-[320px]">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Projets", value: "12", color: "text-blue-400" },
                    { label: "Idées", value: "47", color: "text-yellow-400" },
                    { label: "Scripts", value: "23", color: "text-green-400" },
                    { label: "Titres", value: "89", color: "text-purple-400" },
                  ].map((stat) => (
                      <div key={stat.label}
                           className="bg-card border border-border/50 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-card border border-border/50
                                rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium">Idées récentes</p>
                    {[
                      "5 outils IA que tout YouTubeur doit connaître",
                      "Comment créer du contenu viral en 2025",
                      "Les secrets des créateurs à 1M d'abonnés",
                    ].map((idea, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm
                                            text-muted-foreground">
                          <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          <span className="truncate">{idea}</span>
                        </div>
                    ))}
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Quotas</p>
                    <div className="space-y-2">
                      {[
                        { label: "Idées", pct: 60 },
                        { label: "Scripts", pct: 30 },
                        { label: "Titres", pct: 80 },
                      ].map((q) => (
                          <div key={q.label}>
                            <div className="flex justify-between text-xs
                                        text-muted-foreground mb-1">
                              <span>{q.label}</span>
                              <span>{q.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${q.pct}%` }}
                              />
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── LOGOS / SOCIAL PROOF ───────────────────────── */}
        <section className="py-12 border-y border-border/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-muted-foreground mb-8">
              Fait pour les créateurs sur toutes les plateformes
            </p>
            <div className="flex items-center justify-center gap-12 flex-wrap">
              {[
                { icon: Youtube, label: "YouTube" },
                { icon: Music2, label: "TikTok" },
                { icon: Users, label: "Instagram" },
                { icon: TrendingUp, label: "LinkedIn" },
              ].map((platform) => (
                  <div key={platform.label}
                       className="flex items-center gap-2 text-muted-foreground">
                    <platform.icon className="w-5 h-5" />
                    <span className="font-medium">{platform.label}</span>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────── */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Du pipeline créatif complet — de l&apos;idée au titre optimisé
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Lightbulb,
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                  title: "Génération d'idées",
                  description:
                      "Obtenez des dizaines d'idées pertinentes selon votre niche, plateforme et audience cible en quelques secondes.",
                  features: ["Par thème et niche", "Filtres par plateforme", "Sauvegarde et tags"],
                },
                {
                  icon: FileText,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                  title: "Scripts IA",
                  description:
                      "Générez des scripts complets et engageants. Reformulez, allongez, raccourcissez ou changez le ton en un clic.",
                  features: ["Versioning illimité", "Estimation de durée", "Export PDF/DOCX"],
                },
                {
                  icon: Type,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                  title: "Titres optimisés",
                  description:
                      "Générez 10 variantes de titres avec score SEO, analyse des mots-clés et optimisation par plateforme.",
                  features: ["Score d'engagement", "Analyse SEO", "Limite par plateforme"],
                },
              ].map((feature, i) => (
                  <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border/50 rounded-2xl p-6
                           hover:border-primary/30 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} flex
                                 items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                      ))}
                    </ul>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-6 bg-muted/20">
          <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Tarifs</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Simple et transparent
              </h2>
              <p className="text-muted-foreground text-lg">
                Commencez gratuitement, évoluez selon vos besoins
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Free",
                  price: "0",
                  currency: "XOF",
                  description: "Pour démarrer",
                  popular: false,
                  features: [
                    "3 projets actifs",
                    "5 idées / jour",
                    "3 améliorations / jour",
                    "5 titres / jour",
                    "Export TXT",
                  ],
                },
                {
                  name: "Pro",
                  price: "6 550",
                  currency: "XOF/mois",
                  description: "Pour les créateurs actifs",
                  popular: true,
                  features: [
                    "Projets illimités",
                    "50 idées / jour",
                    "30 améliorations / jour",
                    "Titres illimités",
                    "Export PDF + DOCX",
                    "Collaboration",
                    "Support prioritaire",
                  ],
                },
                {
                  name: "Business",
                  price: "19 670",
                  currency: "XOF/mois",
                  description: "Pour les agences",
                  popular: false,
                  features: [
                    "Tout ce qui est dans Pro",
                    "Générations illimitées",
                    "Choix du modèle IA",
                    "API access",
                    "Support dédié",
                  ],
                },
              ].map((plan, i) => (
                  <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative rounded-2xl p-6 border ${
                          plan.popular
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                              : "border-border/50 bg-card"
                      }`}
                  >
                    {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                          Populaire
                        </Badge>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {plan.description}
                      </p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">
                      {plan.currency}
                    </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                      ))}
                    </ul>

                    <Link href="/register">
                      <Button
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                      >
                        Commencer
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────── */}
        <section id="testimonials" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4">Témoignages</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Ils nous font confiance
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Kofi A.",
                  role: "YouTubeur Tech · 45K abonnés",
                  content:
                      "Armin m'a fait économiser 3h par semaine sur la création de contenu. Mes idées sont maintenant toujours pertinentes.",
                  stars: 5,
                },
                {
                  name: "Aminata D.",
                  role: "Copywriter Freelance",
                  content:
                      "Les titres générés par Armin ont augmenté mon taux de clic de 40%. Un outil indispensable.",
                  stars: 5,
                },
                {
                  name: "Marcus T.",
                  role: "Agence Digitale · Lomé",
                  content:
                      "On gère 12 clients avec Armin Business. La fonctionnalité projets et collaboration est parfaite.",
                  stars: 5,
                },
              ].map((testimonial, i) => (
                  <motion.div
                      key={testimonial.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border/50 rounded-2xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.stars)].map((_, j) => (
                          <Star
                              key={j}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
          >
            <div className="bg-card border border-border/50 rounded-3xl p-12
                          relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5
                            to-transparent pointer-events-none" />
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                Prêt à créer plus vite ?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Rejoignez les créateurs qui utilisent Armin pour produire
                du contenu de qualité sans effort.
              </p>
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base px-10 h-12">
                  Créer mon compte gratuit
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Gratuit · Sans carte bancaire · Accès immédiat
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────── */}
        <footer className="border-t border-border/50 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row
                        items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">Armin</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Armin · Fait avec ❤️ au Togo 🇹🇬
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                CGU
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
  );
}