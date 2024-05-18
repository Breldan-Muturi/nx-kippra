import { PieData } from '@/components/charts/pie';
import { BarDatum } from '@nivo/bar';
import { FunnelDatum } from '@nivo/funnel';
import { Serie } from '@nivo/line';

export type BarReturn =
  | { data: BarDatum[]; keys: string[] }
  | { error: string };

export type PieRequest = { error: string } | PieData[];

export type LineRequest = Serie[] | { error: string };
export type FunnelRequest = FunnelDatum[] | { error: string };
