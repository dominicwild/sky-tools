import QuestTracker from "@/components/QuestTracker";

export default function Home() {
    return (
        <main className="overflow-hidden relative">
            {/* Simple gradient background */}
            <div className="fixed inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200"></div>

            {/* Content */}
            <div className="relative z-10">
                <QuestTracker />
            </div>
        </main>
    )
}