export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

export type SubscriptionPlan = "FREE" | "PRO" | "BUSINESS";
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface Subscription {
    id: number;
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
    status: string;
    startDate: string;
    endDate: string | null;
    ideasUsedToday: number;
    scriptsUsedToday: number;
    titlesUsedToday: number;
}

export type Platform =
    | "YOUTUBE"
    | "TIKTOK"
    | "INSTAGRAM"
    | "LINKEDIN"
    | "BLOG"
    | "PODCAST";

export interface Project {
    id: number;
    name: string;
    description: string;
    platform: Platform;
    niche: string;
    archived: boolean;
    ownerEmail: string;
    createdAt: string;
}

export type IdeaStatus = "SAVED" | "CONVERTED" | "REJECTED";

export interface Idea {
    id: number;
    title: string;
    description: string;
    projectId?: number;
    tags: string;
    notes: string;
    platform: Platform;
    format: string;
    status: IdeaStatus;
    createdAt: string;
}

export type ScriptTone =
    | "EDUCATIF"
    | "HUMORISTIQUE"
    | "INSPIRANT"
    | "PROFESSIONNEL"
    | "CONVERSATIONNEL"
    | "DRAMATIQUE";

export interface ScriptVersion {
    versionNumber: number;
    content: string;
    changeDescription: string;
    createdAt: string;
}

export interface Script {
    id: number;
    projectId?: number;
    title: string;
    content: string;
    tone: ScriptTone;
    wordCount: number;
    estimatedDurationSeconds: number;
    estimatedDuration: string;
    versions: ScriptVersion[];
    createdAt: string;
}

export interface Title {
    id: number;
    projectId?: number;
    content: string;
    engagementScore: number;
    characterCount: number;
    keywords: string;
    selected: boolean;
    platformLimit: string;
    createdAt: string;
}

export interface QuotaInfo {
    used: number;
    limit: number;
    remaining: number;
    unlimited: boolean;
    percentage: number;
}

export interface RecentActivity {
    type: string;
    title: string;
    projectName: string;
    createdAt: string;
}

export interface RecentProject {
    id: number;
    name: string;
    platform: Platform;
    ideaCount: number;
    scriptCount: number;
}

export interface DashboardData {
    totalProjects: number;
    totalIdeas: number;
    totalScripts: number;
    totalTitles: number;
    ideaQuota: QuotaInfo;
    scriptQuota: QuotaInfo;
    titleQuota: QuotaInfo;
    currentPlan: SubscriptionPlan;
    planExpiresAt: string;
    recentActivities: RecentActivity[];
    recentProjects: RecentProject[];
}