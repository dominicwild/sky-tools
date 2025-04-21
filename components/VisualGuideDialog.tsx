import { Dialog, DialogContent } from "@/components/ui/dialog"
import {Quest} from "@/components/QuestTracker";

interface VisualGuideDialogProps {
    isOpen: boolean
    quest: Quest | null
    onClose: () => void
}

export default function VisualGuideDialog({ isOpen, quest, onClose }: VisualGuideDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-black/80 backdrop-blur-lg border-none text-white">
                <div className="mt-4">
                    {quest?.visualGuideUrl ? (
                        <div className="flex justify-center">
                            <img
                                src={quest.visualGuideUrl || "/placeholder.svg"}
                                alt="Visual guide"
                                className="max-h-[70vh] object-contain rounded-lg"
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = "/sky-cotl-quest-journey.png"
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">No visual guide available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
