import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";
import { Analytics } from "@vercel/analytics/remix";
import PageViewTracker from "./components/page-view-tracker";
import appStylesHref from "./styles/tailwind.css?url";
import portfolioStylesHref from "./styles/portfolio.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Doto:wght@400..900&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon-pr.svg" },
  { rel: "shortcut icon", href: "/favicon-pr.svg" },
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: portfolioStylesHref },
];

export const meta: MetaFunction = () => [
  { title: "Praneeth Reddy — AI Engineer & Cybersecurity Researcher" },
  {
    name: "description",
    content:
      "AI engineering and cybersecurity research by Praneeth Reddy.",
  },
];

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Analytics />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <PageViewTracker />
      <Outlet />
    </>
  );
}
