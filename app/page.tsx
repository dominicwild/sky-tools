import QuestTracker from "@/components/QuestTracker";
import {CloudEffect} from "@/components/CloudEffect";
import {getTodaysQuests} from "@/server/redis";

export default function Home() {
    const todaysQuests = getTodaysQuests();
    return (
        <main className="relative">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect/>
            </div>

            <div className={"min-h-screen"}>
                <QuestTracker todaysQuests={todaysQuests}/>
            </div>
        </main>
    )
}