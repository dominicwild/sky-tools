import React from 'react';
import {CloudEffect} from "@/components/CloudEffect";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";

const Page = () => {
    return (
        <main className="relative">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect/>
            </div>

            <div className={"min-h-screen flex flex-col items-center  relative"}>
                <img
                    className={"h-[30vh] mb-4 mt-20"}
                    src={"/feast.webp"}
                    alt={"sky kid eat"}
                />
                <div
                    className={"relative z-10 w-[50%] bg-black/40 backdrop-blur-md rounded-2xl p-8 pt-4 items-center shadow-xl border border-white/30 text-white"}
                >
                    <Button asChild variant={"ghost"} className={"mb-2"}>
                        <Link href={"/"}>
                            <ArrowLeft/>
                            Back to tracking quests
                        </Link>
                    </Button>
                    <div className={"mb-4"}>
                        <h1 className={"text-xl font-semibold mb-1"}>
                            What is this app?
                        </h1>
                        <div>
                            This app tracks Sky daily quests. I mostly made it because tracking daily quests where you
                            must
                            relive a specific spirit is very annoying. I'd go to Sky wiki CTRL+F and find the spirit and
                            view the guide. The process was a bit clunky, so I made this site to track it faster, easier
                            and
                            using a nicer UI!
                        </div>
                    </div>
                    <div className={"mb-4"}>
                        <h1 className={"text-xl font-semibold mb-1"}>
                            How do I use it?
                        </h1>
                        <div>
                            To use this app just search for the daily quest you want on the home page! It is that easy!
                            Tap the visual guide or the video button to view the respective guides
                        </div>
                    </div>
                    <div className={"mb-4"}>
                        <h1 className={"text-xl font-semibold mb-1"}>
                            Did you make all these guides?
                        </h1>
                        <div>
                            Nope! This content comes from the Sky Wiki, which in turn comes from the Sky Infographics
                            Discord. I just wrapped it up all nice and pretty. Credit goes wholly towards those who
                            makes these resources!
                        </div>
                    </div>
                    <div>
                        <h1 className={"text-xl font-semibold mb-1"}>
                            I don't see a quest I searched for?
                        </h1>
                        <div>
                            The information on this site is static. So it needs to be manually updated with the latest
                            information, also some visual and video guides are not present. If you want to contribute
                            feel free to head over to the project on&nbsp;
                            <Link
                                href={"https://github.com/dominicwild/sky-tools"}
                                className={"text-blue-100 hover:text-blue-700 underline"}
                            >
                                Github here
                            </Link>. You can also&nbsp;
                            <Link
                                href={"mailto:dom@dominicwild.com"}
                                className={"text-blue-100 hover:text-blue-700 underline"}
                            >
                                email me at dom@dominicwild.com
                            </Link>
                            &nbsp;as well, if it is easier and I'll add it when I have time! If you have any other ideas
                            of suggestions on how to improve the site drop them my way or contribute them yourself.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Page;