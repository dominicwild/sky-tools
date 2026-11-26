import {Card, CardContent} from "@/components/ui/card"
import LoadingDots from "@/components/LoadingDots"

export default function QuestLoadingSlot() {
    return (
        <Card className="bg-sky-700/50 backdrop-blur-sm border-2 border-white/50 shadow-md rounded-2xl" role="status">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <p className="text-white text-xl">Fetching today&apos;s daily quests</p>
                <div className="h-6 mt-1 flex items-center">
                    <LoadingDots/>
                </div>
            </CardContent>
        </Card>
    )
}
