import type {Metadata} from "next";
import {Nunito} from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import {ThemeToggle} from "@/components/ThemeToggle";
import {Analytics} from "@vercel/analytics/react"
import {siteDescription, siteName, siteUrl} from "@/lib/seo";

const themeScript = `(()=>{let s=null;try{s=localStorage.getItem('theme');}catch(e){}const d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);})();`;

export const metadata: Metadata = {
    metadataBase: siteUrl,
    applicationName: siteName,
    title: {
        default: siteName,
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: siteName,
        description: siteDescription,
        url: "/",
        siteName,
        images: [
            {
                url: "/sky-logo.png",
                width: 800,
                height: 420,
                alt: "Sky Quest Tracker logo",
            },
        ],
        locale: "en_GB",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: ["/sky-logo.png"],
    },
    icons: {
        icon: "/favicon.ico",
    },
};

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"]
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: siteName,
        description: siteDescription,
        url: siteUrl.toString(),
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        inLanguage: "en-GB",
        creator: {
            "@type": "Person",
            name: "Dominic Wild",
            url: "https://github.com/dominicwild",
        },
        sameAs: [
            "https://github.com/dominicwild/sky-tools",
        ],
    };

    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${nunito.variable} antialiased min-h-screen sky-backdrop`}
        >
        <script dangerouslySetInnerHTML={{__html: themeScript}}/>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
        />
        <Analytics/>

        <ThemeToggle/>

        {children}

        <Footer/>
        </body>
        </html>
    );
}
