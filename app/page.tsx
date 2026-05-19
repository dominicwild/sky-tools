import QuestTracker from "@/components/QuestTracker";
import {CloudEffect} from "@/components/CloudEffect";
import {getSkyHelperQuestDisplayData, getTodaysQuests} from "@/server/redis";
import {createPageMetadata, siteDescription} from "@/lib/seo";
import {resolveDailyQuestDisplayData} from "@/lib/daily-quest-source";
import {questsData} from "@/data/questData";

export const metadata = createPageMetadata(
    "Sky Daily Quest Tracker",
    siteDescription,
    "/",
);

export default async function Home() {
    const userQuestCounts = getTodaysQuests();
    const skyHelperQuestData = getSkyHelperQuestDisplayData(userQuestCounts);
    const initialQuestData = resolveDailyQuestDisplayData(null, await userQuestCounts, questsData);

    return (
        <main className="relative">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect/>
            </div>

            <div className={"min-h-screen"}>
                <QuestTracker initialQuestData={initialQuestData} skyHelperQuestData={skyHelperQuestData}/>
            </div>
        </main>
    )
}
