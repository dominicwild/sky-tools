import React, {ReactNode} from 'react';
import {Divide, Mail, Mailbox} from "lucide-react";
import Link from 'next/link';
import {LinkProps} from "next/dist/client/link";

type Link = {
    href: string,
    text: string,
}

const links = [
    {
        href: "/about",
        text: "About",
    },
    {
        href: "/contact",
        text: "Contact",
    },
    {
        href: "/somewhere",
        text: "Github",
    },
]

type FootLinkProps = LinkProps & {
    children: ReactNode
    target?: string
    rel?: string
}

const FooterLink = (props: FootLinkProps) => {
    const {href, children, target, rel, ...otherProps} = props;
    return (
        <Link href={href} target={target} rel={rel} className={"hover:text-white transition-all"} {...otherProps}>
            {children}
        </Link>
    )
}

const Footer = () => {
    return (
        <footer
            className={"relative z-20 bg-gradient-to-b from-sky-700 to-sky-800 min-h-32 flex items-center text-white/70 gap-x-2 justify-around px-[25%] py-6"}>
            <div className={"flex flex-col min-w-20 gap-y-2"}>
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
                <FooterLink href={"/about"}>
                    About
                </FooterLink>
                <FooterLink href={"mailto:dom@dominicwild.com"}>
                    Contact
                </FooterLink>
                <FooterLink href={"https://github.com/dominicwild/sky-tools"} target="_blank" rel="noopener noreferrer">
                    Github
                </FooterLink>
            </div>
            <div className={"flex flex-col min-w-20 gap-y-2"}>
                <div className={"text-white/90 font-bold text-xl"}>
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
                <FooterLink href={"https://discord.gg/thatskygame"} target={"_blank"} rel="noopener noreferrer">
                    Sky Discord
                </FooterLink>
                <FooterLink href={"https://discord.gg/skyinfographicsdatabase"} target="_blank"
                            rel="noopener noreferrer">
                    Sky Infographics
                </FooterLink>
                <FooterLink href={"https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki"}
                            target="_blank" rel="noopener noreferrer">
                    Sky Wiki
                </FooterLink>
            </div>
        </footer>
    );
};

export default Footer;