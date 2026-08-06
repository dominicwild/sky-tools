import React, {ReactNode} from 'react';
import Link from 'next/link';
import {LinkProps} from "next/dist/client/link";

type FootLinkProps = LinkProps & {
    children: ReactNode
    target?: string
    rel?: string
}

const FooterLink = (props: FootLinkProps) => {
    const {href, children, target, rel, ...otherProps} = props;
    return (
        <Link href={href} target={target} rel={rel} className={"cursor-pointer break-words hover:text-white transition-all"} {...otherProps}>
            {children}
        </Link>
    )
}

const Footer = () => {
    return (
        <footer
            className={"relative z-20 grid min-h-32 grid-cols-3 items-start gap-x-3 bg-gradient-to-b from-sky-700 to-sky-800 px-6 py-6 text-white/70 sm:px-12 md:grid-cols-[repeat(3,max-content)] md:justify-around md:gap-x-0 lg:px-[25%]"}>
            <div className={"contents"}>
                <div className={"col-start-1 row-start-1 min-w-0"}>
                    <div>
                        <div className={"flex items-center text-xl"}>
                            <span className={"text-white/90 font-bold text-xl"}>
                            Links
                            </span>
                            <img
                                className={"inline h-[1em] ml-1"}
                                src={"/light.webp"}
                                alt={"light"}
                            />
                        </div>
                        <div className={"h-[0.1rem] bg-blue-200/40 rounded-full mb-1"}/>
                    </div>
                </div>
                <div className={"col-start-1 row-start-2 flex min-w-0 flex-col gap-y-2"}>
                    <FooterLink href={"/about"}>
                        About
                    </FooterLink>
                    <FooterLink href={"/calendar"}>
                        Calendar
                    </FooterLink>
                    <FooterLink href={"mailto:dom@dominicwild.com"}>
                        Contact
                    </FooterLink>
                    <FooterLink href={"https://github.com/dominicwild/sky-tools"} target="_blank" rel="noopener noreferrer">
                        Github
                    </FooterLink>
                </div>
            </div>
            <div className={"contents"}>
                <div className={"col-start-2 row-start-1 min-w-0 text-white/90 font-bold text-xl"}>
                    <div>
                        <span>
                            Other Tools
                        </span>
                        <img
                            className={"inline h-[1em] ml-2"}
                            src={"/oreo-fist-bump-min.webp"}
                            alt={"happy crab"}
                        />
                    </div>
                    <div className={"h-[0.1rem] bg-blue-200/40 rounded-full mb-1"}/>
                </div>
                <div className={"col-start-2 row-start-2 flex min-w-0 flex-col gap-y-2"}>
                    <FooterLink href={"https://sky-clock.netlify.app/"} target={"_blank"} rel="noopener noreferrer">
                        Sky Clock
                    </FooterLink>
                    <FooterLink href={"https://sky-shards.pages.dev/"} target="_blank"
                                rel="noopener noreferrer">
                        Sky Shard Events
                    </FooterLink>
                    <FooterLink href={"https://sky-children-of-the-light.fandom.com/wiki/Fan-Made_Sky_Tools"}
                                target="_blank" rel="noopener noreferrer">
                        Other Tools
                    </FooterLink>
                </div>
            </div>
            <div className={"contents"}>
                <div className={"col-start-3 row-start-1 min-w-0 text-white/90 font-bold text-xl"}>
                    <div>
                        <span>
                            Credits
                        </span>
                        <img
                            className={"inline h-[1em] ml-2"}
                            src={"/crab-hap.webp"}
                            alt={"happy crab"}
                        />
                    </div>
                    <div className={"h-[0.1rem] bg-blue-200/40 rounded-full mb-1"}/>
                </div>
                <div className={"col-start-3 row-start-2 flex min-w-0 flex-col gap-y-2"}>
                    <FooterLink href={"https://discord.gg/thatskygame"} target={"_blank"} rel="noopener noreferrer">
                        Sky Discord
                    </FooterLink>
                    <FooterLink href={"https://discord.gg/skyinfographicsdatabase"} target="_blank"
                                rel="noopener noreferrer">
                        Sky Infographics
                    </FooterLink>
                    <FooterLink href={"https://thatskyapplication.com/"} target="_blank" rel="noopener noreferrer">
                        thatskyapplication
                    </FooterLink>
                    <FooterLink href={"https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki"}
                                target="_blank" rel="noopener noreferrer">
                        Sky Wiki
                    </FooterLink>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
