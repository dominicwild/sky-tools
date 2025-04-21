import QuestTracker from "@/components/QuestTracker";
import {CloudEffect} from "@/components/CloudEffect";

export default function Home() {
    return (
        <main className="relative">
            <div className="fixed inset-0">
                <CloudEffect />
            </div>

            <div >
                <QuestTracker />
            </div>
        </main>
    )
}