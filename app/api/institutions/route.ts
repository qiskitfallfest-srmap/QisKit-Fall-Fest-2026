import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const KNOWN_SEED_INSTITUTIONS = [
  'SRM University-AP',
  'Andhra Loyola College (ALC), Vijayawada',
  'Andhra Loyola Institute of Engineering & Technology (ALIET), Vijayawada',
  'BITS Pilani (Hyderabad Campus)',
  'Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam',
  'Indian Institute of Information Technology (IIIT), Sri City',
  'Indian Institute of Technology (IIT), Madras',
  'Indian Institute of Technology (IIT), Tirupati',
  'JNTU College of Engineering, Kakinada (JNTUK)',
  'JNTU College of Engineering, Anantapur (JNTUA)',
  'KKR & KSR Institute of Technology and Sciences (KITS), Guntur',
  'K L University (KLEF), Vaddeswaram, Guntur',
  'National Institute of Technology (NIT), Andhra Pradesh',
  'National Institute of Technology (NIT), Warangal',
  'Prasad V. Potluri Siddhartha Institute of Technology (PVPSIT), Vijayawada',
  'RVR & JC College of Engineering, Guntur',
  'Saveetha Institute of Medical and Technical Sciences (SIMATS), Chennai',
  'SRM Institute of Science and Technology (KTR Campus)',
  'SRM University, Delhi-NCR, Sonipat',
  'University College of Engineering JNTUK, Narasaraopet',
  'Vasireddy Venkatadri Institute of Technology (VVIT), Guntur',
  'Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), Vijayawada',
  'Vignan’s Foundation for Science, Technology & Research (VFSTR), Vadlamudi',
  'Vignan’s Nirula Institute of Technology and Science for Women, Guntur',
  'VIT-AP University, Amaravati',
  'VIT University, Vellore',
];

export async function GET() {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('registrations')
      .select('institution')
      .not('institution', 'is', null)
      .limit(2000);

    const institutionSet = new Set<string>();

    for (const item of KNOWN_SEED_INSTITUTIONS) {
      institutionSet.add(item);
    }

    if (!error && rows) {
      for (const r of rows) {
        const inst = String(r.institution || '').trim();
        if (
          inst &&
          inst.length > 2 &&
          !inst.toLowerCase().includes('college / university') &&
          !inst.toLowerCase().includes('college/university') &&
          inst.toLowerCase() !== 'n/a' &&
          inst.toLowerCase() !== 'none'
        ) {
          institutionSet.add(inst);
        }
      }
    }

    const institutions = Array.from(institutionSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return NextResponse.json(
      {
        success: true,
        institutions,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('[Institutions API Error]:', err);
    return NextResponse.json(
      { success: true, institutions: KNOWN_SEED_INSTITUTIONS.sort() },
      { status: 200 }
    );
  }
}
