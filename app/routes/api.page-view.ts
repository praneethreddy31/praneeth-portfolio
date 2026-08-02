import { json, type ActionFunctionArgs } from "@remix-run/node";
import { incrementPageView } from "../lib/page-views.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method.toUpperCase() !== "POST") {
    return json(
      { error: "Method not allowed" },
      {
        headers: { Allow: "POST" },
        status: 405,
      },
    );
  }

  const url = new URL(request.url);
  const pageView = await incrementPageView(url.searchParams.get("source"));

  return json({
    source: pageView.source,
    total: pageView.total,
  });
}

export function loader() {
  return json(
    { error: "Method not allowed" },
    {
      headers: { Allow: "POST" },
      status: 405,
    },
  );
}
