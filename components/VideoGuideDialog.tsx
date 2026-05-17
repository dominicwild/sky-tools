import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import type {Quest} from "@/lib/quest-types";

interface VideoGuideDialogProps {
    isOpen: boolean
    quest: Quest | null
    onClose: () => void
}

export default function VideoGuideDialog({isOpen, quest, onClose}: VideoGuideDialogProps) {
    const videoGuideUrl = quest?.videoGuideUrl;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogTitle className={"hidden"}>
                Video Guide
            </DialogTitle>
            <DialogContent
                className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] bg-black/90 backdrop-blur-lg border-none text-white"
                onOpenAutoFocus={(event) => event.preventDefault()}>
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

function isDirectVideoUrl(url: string) {
    const pathname = getUrlPathname(url).toLowerCase();
    return [".mp4", ".webm", ".mov"].some((extension) => pathname.endsWith(extension));
}

function getYouTubeEmbedUrl(url: string) {
    return url
        .replace("youtu.be/", "youtube.com/embed/")
        .replace("youtube.com/watch?v=", "youtube.com/embed/")
}

function getUrlPathname(url: string) {
    try {
        return new URL(url).pathname;
    } catch {
        return url.split("?")[0] ?? url;
    }
}
