import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getSkillsContent, updateSkillsContent } from '@/lib/skills-db';
import { parseSkills } from '@/lib/validate';

export const dynamic = 'force-dynamic';

// Panel için mevcut donanım içeriği.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  try {
    const content = await getSkillsContent();
    return NextResponse.json({ content });
  } catch (err) {
    console.error('GET /api/admin/skills', err);
    return NextResponse.json({ error: 'Donanım içeriği getirilemedi.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 });
  }

  const parsed = parseSkills(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    await updateSkillsContent(parsed.content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/skills', err);
    return NextResponse.json({ error: 'Donanım içeriği kaydedilemedi.' }, { status: 500 });
  }
}
