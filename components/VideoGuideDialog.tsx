import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {isDirectVideoUrl} from "@/lib/video-guide-url";
import type {GuideMedia} from "@/lib/quest-types";

interface VideoGuideDialogProps {
    isOpen: boolean
    quest: GuideMedia | null
    onClose: () => void
}

export default function VideoGuideDialog({isOpen, quest, onClose}: VideoGuideDialogProps) {
    const videoGuideUrl = quest?.videoGuideUrl;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] bg-black/90 backdrop-blur-lg border-none text-white"
                onOpenAutoFocus={(event) => event.preventDefault()}>
                <DialogTitle className="sr-only">Video Guide</DialogTitle>
                <DialogDescription className="sr-only">
                    Video guide for {quest?.questName ?? "the selected quest"}.
                </DialogDescription>
                <div className="mt-4">
                    {videoGuideUrl ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden">
                            {isDirectVideoUrl(videoGuideUrl) ? (
                                <video
                                    className="w-full h-full"
                                    src={videoGuideUrl}
                                    title={`${quest.questName} video guide`}
                                    controls
                                />
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src={getYouTubeEmbedUrl(videoGuideUrl)}
                                    title={`${quest.questName} video guide`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">No video guide available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function getYouTubeEmbedUrl(url: string) {
    return url
        .replace("youtu.be/", "youtube.com/embed/")
        .replace("youtube.com/watch?v=", "youtube.com/embed/")
        .replace(/([?&])t=(\d+)s?/, "$1start=$2")
}
