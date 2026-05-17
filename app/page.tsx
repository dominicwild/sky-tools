import QuestTracker from "@/components/QuestTracker";
import {CloudEffect} from "@/components/CloudEffect";
import {getTodaysQuestDisplayData} from "@/server/redis";
import {createPageMetadata, siteDescription} from "@/lib/seo";

export const metadata = createPageMetadata(
    "Sky Daily Quest Tracker",
    siteDescription,
    "/",
);

export default function Home() {
    const todaysQuests = getTodaysQuestDisplayData();
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
