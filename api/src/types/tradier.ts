export interface MarketQuote {
  symbol: string;
  description: string;
  exch: string;
  type: string;
  last: number;
  change: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
  bid: number;
  ask: number;
  change_percentage: number;
  average_volume: number;
  last_volume: number;
  trade_date: number;
  prevclose: number;
  week_52_high: number;
  week_52_low: number;
  bidsize: number;
  bidexch: string;
  bid_date: number;
  asksize: number;
  askexch: string;
  ask_date: number;
  root_symbols: string;
}

export interface OptionsChain {
  symbol: string;
  status: string;
  underlying: {
    symbol: string;
    last: number;
    change: number;
    delta: number;
  };
  options: {
    option: OptionData[];
  };
}

export interface OptionData {
  symbol: string;
  description: string;
  exch: string;
  type: string;
  last: number;
  change: number;
  volume: number;
  openinterest: number;
  bid: number;
  ask: number;
  strike: number;
  contract_size: number;
  expiration_date: string;
  expiration_type: string;
  option_type: string;
  root_symbol: string;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
    phi: number;
    bid_iv: number;
    mid_iv: number;
    ask_iv: number;
    smv_vol: number;
  };
}

export interface GEXCalculation {
  strike: number;
  call_gex: number;
  put_gex: number;
  total_gex: number;
  call_oi: number;
  put_oi: number;
  call_volume: number;
  put_volume: number;
  call_iv?: number;  // Volatilidad implícita de calls
  put_iv?: number;   // Volatilidad implícita de puts
  avg_iv?: number;   // Promedio de IV
}

export interface MarketMetrics {
  spot: number;
  dist_pg_s: number;
  dist_pg_n: number;
  expected_move: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  score: number;
  timestamp: string;
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