import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog"
import {Quest} from "@/components/QuestTracker";
import {getImageUrl} from "@/util/helper";

interface VisualGuideDialogProps {
    isOpen: boolean
    quest: Quest | null
    onClose: () => void
}

export default function VisualGuideDialog({isOpen, quest, onClose}: Readonly<VisualGuideDialogProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogTitle className={"hidden"}>
                Visual Guide
            </DialogTitle>
            <DialogContent
                className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] bg-black/80 backdrop-blur-lg border-none text-white">
                <div className="mt-4">
                    {quest?.visualGuideUrl ? (
                        <div className="flex justify-center">
                            <img
                                src={getImageUrl(quest.visualGuideUrl)}
                                alt="Visual guide"
                                className="max-h-[80vh] object-contain rounded-lg"
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = "/oh-no.png"
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
