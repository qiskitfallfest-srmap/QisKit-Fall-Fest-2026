import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { isEmailWhitelisted, getMemberTeam } from '@/lib/redis';

export async function GET(request: NextRequest) {
  // Teammate lookup for signed-in users only; otherwise this is a public roster oracle.
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get('email');

  if (!emailParam || !emailParam.includes('@')) {
    return NextResponse.json(
      { error: 'Valid email parameter is required' },
      { status: 400 }
    );
  }

  const email = emailParam.trim().toLowerCase();

  try {
    const whitelist = await isEmailWhitelisted(email);
    const teamStatus = await getMemberTeam(email);

    return NextResponse.json({
      email,
      whitelisted: whitelist.whitelisted,
      fullName: whitelist.fullName || null,
      inTeam: teamStatus.inTeam,
      teamName: teamStatus.teamName || null,
      teamStatus: teamStatus.status || null,
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Internal server error verifying email' },
      { status: 500 }
    );
  }
}
