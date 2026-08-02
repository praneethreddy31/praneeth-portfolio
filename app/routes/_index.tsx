import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Portfolio from "../components/portfolio";
import { getLetterboxdEntries } from "../lib/letterboxd.server";

export const meta: MetaFunction = () => [
  { title: "Praneeth Reddy — AI Engineer & Cybersecurity Researcher" },
  { name: "description", content: "Portfolio of Praneeth Reddy, an AI Engineer and Cybersecurity Researcher in Hyderabad, India." },
];

export async function loader() {
  const letterboxd = await getLetterboxdEntries();
  return json({ letterboxd }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
}

export default function Index() {
  const { letterboxd } = useLoaderData<typeof loader>();
  return <Portfolio letterboxd={letterboxd} />;
}
