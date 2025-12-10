export interface MarketMetrics {
  spot: number;
  dist_pg_s: number;
  dist_pg_n: number;
  expected_move: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  score: number;
  timestamp: string;
}

export interface GEXData {
  strike: number;
  call_gex: number;
  put_gex: number;
  total_gex: number;
  call_oi: number;
  put_oi: number;
  call_volume: number;
  put_volume: number;
}

export interface IntradayData {
  timestamp: string;
  price: number;
  pg_point: number;
  strikes_oi: number;
  strikes_volume: number;
  strikes_gex: number;
  pred_oi_gex: number;
  pred_delta_neutral: number;
  pred_volume: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  score: number;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  gex: number;
  oi: number;
  delta_neutral: number;
  volume: number;
  score: number;
}

export interface TrendIndicator {
  name: string;
  value: number;
  range: [-0.5, 0.5];
  color: 'green' | 'red' | 'yellow';
}