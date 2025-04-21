import QuestTracker from "@/components/QuestTracker";
import {CloudEffect} from "@/components/CloudEffect";

export default function Home() {
    return (
        <main className="relative">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect/>
            </div>

            <div className={"min-h-screen"}>
                <QuestTracker/>
            </div>
        </main>
    )
}