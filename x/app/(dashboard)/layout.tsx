import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    useAuthGuard();
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}