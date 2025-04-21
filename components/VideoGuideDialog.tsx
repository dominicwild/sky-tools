import {Quest} from "@/components/QuestTracker";
import {Dialog, DialogContent} from "@/components/ui/dialog";

interface VideoGuideDialogProps {
    isOpen: boolean
    quest: Quest | null
    onClose: () => void
}

export default function VideoGuideDialog({ isOpen, quest, onClose }: VideoGuideDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-black/90 backdrop-blur-lg border-none text-white">
                <div className="mt-4">
                    {quest?.videoGuideUrl ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden">
                            <iframe
                                className="w-full h-full"
                                src={quest.videoGuideUrl
                                    .replace("youtu.be/", "youtube.com/embed/")
                                    .replace("youtube.com/watch?v=", "youtube.com/embed/")}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">No video guide available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
