import type {MetadataRoute} from "next";
import {getCanonicalUrl} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return [
        {
            url: getCanonicalUrl("/"),
            lastModified,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: getCanonicalUrl("/calendar"),
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: getCanonicalUrl("/about"),
            lastModified,
            changeFrequency: "monthly",
            priority: 0.7,
        },
    ];
}
