import type {Metadata} from "next";

export const siteUrl = new URL("https://sky.dominicwild.com");
export const siteName = "Sky Quest Tracker";
export const siteDescription = "Track daily quests in Sky: Children of the Light and quickly find visual and video guides.";

const sharedImage = {
    url: "/sky-logo.png",
    width: 800,
    height: 420,
    alt: "Sky Quest Tracker logo",
};

export function getCanonicalUrl(path: string) {
    return new URL(path, siteUrl).toString();
}

export function createPageMetadata(title: string, description: string, path: string): Metadata {
    return {
        title,
        description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title,
            description,
            url: path,
            siteName,
            images: [sharedImage],
            locale: "en_GB",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [sharedImage.url],
        },
    };
}
