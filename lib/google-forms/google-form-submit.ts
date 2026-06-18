import "server-only";

export function extractGoogleFormId(formUrl: string): string | null {
  const match = formUrl.match(/\/forms\/d\/e\/([^/]+)\//);
  return match?.[1] ?? null;
}

export function getGoogleFormResponseUrl(formViewUrl: string): string {
  return formViewUrl.replace(/\/viewform.*$/, "/formResponse");
}

/** Anti-bot token required for Google Forms to accept a submission. */
export async function fetchGoogleFormFbzx(formViewUrl: string): Promise<string | null> {
  const normalizedUrl = formViewUrl.includes("usp=")
    ? formViewUrl
    : `${formViewUrl}${formViewUrl.includes("?") ? "&" : "?"}usp=pp_url`;

  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const match =
      html.match(/name="fbzx"\s+value="(-?\d+)"/) ??
      html.match(/"fbzx":"(-?\d+)"/) ??
      html.match(/FB_PUBLIC_LOAD_DATA_[^[]*\[\[\["(-?\d+)"/);

    return match?.[1] ?? null;
  } catch (error) {
    console.warn("[fetchGoogleFormFbzx]", error);
    return null;
  }
}
