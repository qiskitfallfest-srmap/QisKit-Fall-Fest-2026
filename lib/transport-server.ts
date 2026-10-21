import { supabaseAdmin } from '@/lib/supabase-admin';
import { DEFAULT_BOARDING_POINTS, TRANSPORT_CONFIG_KEY } from '@/lib/transport';

export interface TransportConfig {
  closed: boolean;
  note: string;
  boardingPoints: string[];
}

export async function getTransportConfig(): Promise<TransportConfig> {
  const { data } = await supabaseAdmin.from('platform_config').select('value').eq('key', TRANSPORT_CONFIG_KEY).limit(1);
  const value = data?.[0]?.value || {};
  const points = Array.isArray(value.boardingPoints)
    ? value.boardingPoints.map((p: unknown) => String(p).trim()).filter(Boolean)
    : [];
  return {
    closed: Boolean(value.closed),
    note: typeof value.note === 'string' ? value.note : '',
    boardingPoints: points.length ? points : DEFAULT_BOARDING_POINTS,
  };
}
