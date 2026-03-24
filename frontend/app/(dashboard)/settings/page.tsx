"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
    User, Lock, Bell, Palette, Shield, LogOut,
    Save, Eye, EyeOff, Loader2, CheckCircle2, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const SECTIONS = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Apparence", icon: Palette },
    { id: "danger", label: "Zone dangereuse", icon: Shield },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { logout } = useAuthStore();

    const [active, setActive] = useState("profile");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Security
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    // Notifications
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifQuota, setNotifQuota] = useState(true);
    const [notifNews, setNotifNews] = useState(false);

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.patch("/api/users/me", { firstName, lastName });
            showSaved();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (newPwd !== confirmPwd) return;
        setSaving(true);
        try {
            await api.post("/api/auth/change-password", { currentPassword: currentPwd, newPassword: newPwd });
            setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
            showSaved();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                value ? "bg-violet-500" : "bg-gray-200 dark:bg-gray-700"
            }`}
        >
      <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              value ? "translate-x-5" : ""
          }`}
      />
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte et vos préférences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar nav */}
                <nav className="md:w-52 shrink-0">
                    <ul className="space-y-1">
                        {SECTIONS.map(({ id, label, icon: Icon }) => (
                            <li key={id}>
                                <button
                                    onClick={() => setActive(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        active === id
                                            ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </nav>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">

                    {/* Saved toast */}
                    {saved && (
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-2.5 rounded-xl mb-6">
                            <CheckCircle2 className="w-4 h-4" />
                            Modifications enregistrées
                        </div>
                    )}

                    {/* Profil */}
                    {active === "profile" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profil</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Prénom
                                    </label>
                                    <input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Jean"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Nom
                                    </label>
                                    <input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Dupont"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">L'email ne peut pas être modifié.</p>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer
                            </button>
                        </div>
                    )}

                    {/* Sécurité */}
                    {active === "security" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sécurité</h2>
                            <div className="space-y-4">
                                {[
                                    { label: "Mot de passe actuel", value: currentPwd, set: setCurrentPwd },
                                    { label: "Nouveau mot de passe", value: newPwd, set: setNewPwd },
                                    { label: "Confirmer le nouveau mot de passe", value: confirmPwd, set: setConfirmPwd },
                                ].map(({ label, value, set }) => (
                                    <div key={label}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPwd ? "text" : "password"}
                                                value={value}
                                                onChange={(e) => set(e.target.value)}
                                                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPwd(!showPwd)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {newPwd && confirmPwd && newPwd !== confirmPwd && (
                                    <p className="text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
                                )}
                            </div>
                            <button
                                onClick={handleSavePassword}
                                disabled={saving || !currentPwd || !newPwd || newPwd !== confirmPwd}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Changer le mot de passe
                            </button>
                        </div>
                    )}

                    {/* Notifications */}
                    {active === "notifications" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                            <div className="space-y-4">
                                {[
                                    { label: "Récapitulatif par email", desc: "Reçois un résumé hebdomadaire de ton activité", value: notifEmail, set: setNotifEmail },
                                    { label: "Alertes de quota", desc: "Sois averti quand tu atteins 80% de ton quota quotidien", value: notifQuota, set: setNotifQuota },
                                    { label: "Nouveautés & mises à jour", desc: "Reçois les actualités d'Armin et les nouvelles fonctionnalités", value: notifNews, set: setNotifNews },
                                ].map(({ label, desc, value, set }) => (
                                    <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                                        </div>
                                        <Toggle value={value} onChange={set} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Apparence */}
                    {active === "appearance" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apparence</h2>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thème</p>
                                <div className="flex gap-3">
                                    {[
                                        { value: "light", label: "Clair", icon: Sun },
                                        { value: "dark", label: "Sombre", icon: Moon },
                                        { value: "system", label: "Système", icon: Palette },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value)}
                                            className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 transition-all ${
                                                theme === value
                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${theme === value ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`} />
                                            <span className={`text-xs font-medium ${theme === value ? "text-violet-600 dark:text-violet-400" : "text-gray-500"}`}>
                        {label}
                      </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Zone dangereuse */}
                    {active === "danger" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zone dangereuse</h2>
                            <div className="border border-red-200 dark:border-red-800 rounded-xl p-5 space-y-3">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Supprimer mon compte</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Cette action est irréversible. Toutes vos données, projets, idées et scripts seront définitivement supprimés.
                                </p>
                                <button
                                    onClick={() => confirm("Êtes-vous sûr ? Cette action est irréversible.") && api.delete("/api/users/me").then(() => { logout(); router.push("/login"); })}
                                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Supprimer mon compte
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}