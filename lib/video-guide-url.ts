export function isDirectVideoUrl(url: string) {
    const pathname = getUrlPathname(url).toLowerCase();
    return isUploadThingFileUrl(url) || [".mp4", ".webm", ".mov"].some((extension) => pathname.endsWith(extension));
}

function getUrlPathname(url: string) {
    try {
        return new URL(url).pathname;
    } catch {
        return url.split("?")[0] ?? url;
    }
}

function isUploadThingFileUrl(url: string) {
    try {
        const hostname = new URL(url).hostname;
        return hostname === "utfs.io" || hostname.endsWith(".ufs.sh");
    } catch {
        return false;
    }
}
