import { NextResponse } from "next/server";
import type { CatalogBook } from "@/lib/types";
import { parseSavvasJs, convertSavvasBook } from "@/lib/books/convert";
import catalogData from "@/public/content/books/catalog.json";

// Build slug → catalog entry map at module init
const catalog = catalogData as CatalogBook[];
const slugMap = new Map<string, CatalogBook>();
for (const entry of catalog) {
  slugMap.set(entry.id, entry);
}

const CDN_BASE =
  "https://d3etodn1cqduev.cloudfront.net/content/ilit/basecontent/library";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const meta = slugMap.get(slug);

  if (!meta) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const guid = meta.savvasId;
  const cdnUrl = `${CDN_BASE}/${guid}/${guid}.js`;

  let raw: string;
  try {
    const res = await fetch(cdnUrl, { next: { revalidate: false } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `CDN returned ${res.status}` },
        { status: 502 }
      );
    }
    raw = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from CDN" },
      { status: 502 }
    );
  }

  try {
    const content = parseSavvasJs(raw);
    const book = convertSavvasBook(content, meta);

    return NextResponse.json(book, {
      headers: {
        "Cache-Control":
          "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert book content" },
      { status: 500 }
    );
  }
}
