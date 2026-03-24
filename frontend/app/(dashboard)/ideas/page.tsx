import { Suspense } from "react";
import IdeasContent from "./IdeasContent";

export default function IdeasPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <IdeasContent />
        </Suspense>
    );
}