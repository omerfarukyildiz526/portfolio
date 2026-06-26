import { NextResponse } from 'next/server';
import { getSkillsContent } from '@/lib/skills-db';
import { SEED_SKILLS } from '@/lib/skills-content';

export const dynamic = 'force-dynamic';

// Donanım sayfasının herkese açık içeriği. Hata olursa seed içeriğe düşer.
export async function GET() {
  try {
    const content = await getSkillsContent();
    return NextResponse.json({ content });
  } catch (err) {
    console.error('GET /api/skills', err);
    return NextResponse.json({ content: SEED_SKILLS });
  }
}
