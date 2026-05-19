import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog"
import {getImageUrl} from "@/util/helper";
import type {GuideMedia} from "@/lib/quest-types";

interface VisualGuideDialogProps {
    isOpen: boolean
    quest: GuideMedia | null
    onClose: () => void
}

export default function VisualGuideDialog({isOpen, quest, onClose}: Readonly<VisualGuideDialogProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] bg-black/80 backdrop-blur-lg border-none text-white"
                onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogTitle className="sr-only">Visual Guide</DialogTitle>
                <DialogDescription className="sr-only">
                    Expanded visual guide for {quest?.questName ?? "the selected quest"}.
                </DialogDescription>
                <div className="mt-4">
                    {quest?.visualGuideUrl ? (
                        <div className="flex justify-center">
                            <img
                                src={getImageUrl(quest.visualGuideUrl)}
                                alt={`Visual guide for ${quest.questName}`}
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
