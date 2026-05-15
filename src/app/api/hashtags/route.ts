import { NextRequest, NextResponse } from "next/server";

// POST /api/hashtags
// Body: { topic: string, platform: string, count: number, lang: string[], mix: string[] }

const PLATFORM_CONTEXT: Record<string, string> = {
  instagram:
    "Instagram (max 30 hashtags per post, mix of niche and broad tags, community tags important)",
  tiktok:
    "TikTok (trending tags matter most, FYP/ForYou tags, shorter snappier hashtags preferred)",
  twitter:
    "X/Twitter (max 2-3 hashtags ideal, keep concise, trending topics matter)",
  linkedin:
    "LinkedIn (professional tone, industry keywords, 3-5 hashtags optimal, B2B context)",
  youtube:
    "YouTube (descriptive tags, search-intent keywords, mix broad and specific)",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY chưa được cấu hình trong .env.local" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const {
    topic,
    platform,
    count = 30,
    lang = ["en"],
    mix = ["trending", "niche", "broad"],
  } = body;

  if (!topic?.trim()) {
    return NextResponse.json(
      { error: "Topic không được để trống" },
      { status: 400 },
    );
  }

  const platformCtx = PLATFORM_CONTEXT[platform] ?? platform;
  const langInstruction =
    lang.includes("vi") && lang.includes("en")
      ? "Mix cả tiếng Việt và tiếng Anh (khoảng 50/50)."
      : lang.includes("vi")
        ? "Dùng tiếng Việt là chủ yếu."
        : "Use English only.";

  const mixInstruction = mix.length
    ? `Include a mix of: ${mix.join(", ")} hashtags.`
    : "";

  const prompt = `You are a social media hashtag expert.

Generate exactly ${count} relevant hashtags for the following topic on ${platformCtx}.

Topic: "${topic.trim()}"

Requirements:
- ${langInstruction}
- ${mixInstruction}
- Return ONLY a JSON array of strings, no explanations, no markdown, no extra text.
- Each hashtag must start with # symbol.
- No duplicate hashtags.
- Order from most relevant/important to least.
- Hashtags should be realistic and actually used on the platform.

Example output format:
["#hashtag1", "#hashtag2", "#hashtag3"]`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message ?? `OpenAI API error: ${res.status}`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";

    // Strip markdown fences if present
    const clean = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(clean);
      if (!Array.isArray(hashtags)) throw new Error("Not an array");
      // Ensure # prefix & clean up
      hashtags = hashtags
        .map((h) => (typeof h === "string" ? h.trim() : ""))
        .filter(Boolean)
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .slice(0, count);
    } catch {
      // Fallback: extract #words from raw text
      const matches = rawText.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g) ?? [];
      hashtags = [...new Set(matches)].slice(0, count);
    }

    return NextResponse.json({ hashtags });
  } catch (err) {
    return NextResponse.json(
      { error: `Lỗi kết nối: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
