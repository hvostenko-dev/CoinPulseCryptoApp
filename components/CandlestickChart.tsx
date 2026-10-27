'use client';

import type { ReactNode } from 'react';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from 'react';
import {
    AreaSeries,
    CandlestickSeries,
    createChart,
    LineSeries,
    type IChartApi,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts';
import {
    Activity,
    BarChart2,
    Maximize2,
    TrendingUp,
} from 'lucide-react';

import {
    getCandlestickConfig,
    getChartConfig,
    LIVE_INTERVAL_BUTTONS,
    PERIOD_BUTTONS,
    PERIOD_CONFIG,
} from '@/constants';

import { fetcher } from '@/lib/coingecko.actions';
import { convertOHLCData, formatCurrency } from '@/lib/utils';

type Period = keyof typeof PERIOD_CONFIG;
type LiveInterval = (typeof LIVE_INTERVAL_BUTTONS)[number]['value'];
type ChartMode = 'historical' | 'live';
type SeriesStyle = 'candles' | 'area';

interface CandlestickChartProps {
    children?: ReactNode;
    data?: OHLCData[];
    coinId: string;
    height?: number;
    initialPeriod?: Period;
    liveOhlcv?: OHLCData | null;
    mode?: ChartMode;
    liveInterval?: LiveInterval;
    setLiveInterval?: (interval: LiveInterval) => void;
}

const CandlestickChart = ({
    children,
    data = [],
    coinId,
    height = 370,
    initialPeriod = 'daily',
    liveOhlcv = null,
    mode = 'historical',
    liveInterval,
    setLiveInterval,
}: CandlestickChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    const prevOhlcDataLength = useRef<number>(data?.length ?? 0);

    const [period, setPeriod] = useState<Period>(initialPeriod);
    const [seriesStyle, setSeriesStyle] = useState<SeriesStyle>('candles');
    const [showSma, setShowSma] = useState<boolean>(true);
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
    const [hoveredCandle, setHoveredCandle] = useState<{
        open: number;
        high: number;
        low: number;
        close: number;
    } | null>(null);

    const [isPending, startTransition] = useTransition();

    const fetchOHLCData = async (selectedPeriod: Period): Promise<void> => {
        try {
            const { days } = PERIOD_CONFIG[selectedPeriod];

            const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
                vs_currency: 'usd',
                days,
                precision: 'full',
            });

            startTransition(() => {
                setOhlcData(Array.isArray(newData) ? newData : []);
            });
        } catch (error) {
            console.error(
                'Failed to fetch OHLC data:',
                error instanceof Error ? error.message : error,
            );
        }
    };

    const handlePeriodChange = (newPeriod: Period): void => {
        if (newPeriod === period || isPending) {
            return;
        }

        setPeriod(newPeriod);
        void fetchOHLCData(newPeriod);
    };

    useEffect(() => {
        setOhlcData(data ?? []);
        prevOhlcDataLength.current = data?.length ?? 0;
    }, [data, coinId]);

    const processedCandles = useMemo(() => {
        const convertedToSeconds = ohlcData.map(
            (item) =>
                [
                    item[0] > 10_000_000_000
                        ? Math.floor(item[0] / 1000)
                        : item[0],
                    item[1],
                    item[2],
                    item[3],
                    item[4],
                ] as OHLCData,
        );

        let mergedData: OHLCData[];

        if (liveOhlcv) {
            const liveTimestamp =
                liveOhlcv[0] > 10_000_000_000
                    ? Math.floor(liveOhlcv[0] / 1000)
                    : liveOhlcv[0];

            const normalizedLive: OHLCData = [
                liveTimestamp,
                liveOhlcv[1],
                liveOhlcv[2],
                liveOhlcv[3],
                liveOhlcv[4],
            ];

            const lastHistoricalCandle =
                convertedToSeconds[convertedToSeconds.length - 1];

            if (
                lastHistoricalCandle &&
                lastHistoricalCandle[0] === liveTimestamp
            ) {
                mergedData = [
                    ...convertedToSeconds.slice(0, -1),
                    normalizedLive,
                ];
            } else {
                mergedData = [...convertedToSeconds, normalizedLive];
            }
        } else {
            mergedData = convertedToSeconds;
        }

        mergedData.sort((a, b) => a[0] - b[0]);
        return convertOHLCData(mergedData);
    }, [ohlcData, liveOhlcv]);

    const smaData = useMemo(() => {
        const windowSize = 7;
        if (processedCandles.length < windowSize) return [];
        const result: { time: Time; value: number }[] = [];
        for (let i = windowSize - 1; i < processedCandles.length; i++) {
            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += processedCandles[i - j].close;
            }
            result.push({
                time: processedCandles[i].time,
                value: sum / windowSize,
            });
        }
        return result;
    }, [processedCandles]);

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        const showTime = ['daily', 'weekly', 'monthly'].includes(period);

        const chart = createChart(container, {
            ...getChartConfig(height, showTime),
            width: container.clientWidth,
        });

        chartRef.current = chart;

        if (seriesStyle === 'candles') {
            const candleSeries = chart.addSeries(
                CandlestickSeries,
                getCandlestickConfig(),
            );
            candleSeries.setData(processedCandles);
            candleSeriesRef.current = candleSeries;
            areaSeriesRef.current = null;
        } else {
            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor: '#10B981',
                topColor: 'rgba(16, 185, 129, 0.28)',
                bottomColor: 'rgba(6, 182, 212, 0.01)',
                lineWidth: 2,
            });
            areaSeries.setData(
                processedCandles.map((c) => ({
                    time: c.time,
                    value: c.close,
                })),
            );
            areaSeriesRef.current = areaSeries;
            candleSeriesRef.current = null;
        }

        if (showSma && smaData.length > 0) {
            const smaSeries = chart.addSeries(LineSeries, {
                color: '#06B6D4',
                lineWidth: 2,
                crosshairMarkerVisible: false,
                priceLineVisible: false,
            });
            smaSeries.setData(smaData);
            smaSeriesRef.current = smaSeries;
        } else {
            smaSeriesRef.current = null;
        }

        chart.subscribeCrosshairMove((param) => {
            if (!param.time || processedCandles.length === 0) {
                setHoveredCandle(null);
                return;
            }
            const match = processedCandles.find((c) => c.time === param.time);
            if (match) {
                setHoveredCandle({
                    open: match.open,
                    high: match.high,
                    low: match.low,
                    close: match.close,
                });
            }
        });

        chart.timeScale().fitContent();

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            chart.applyOptions({
                width: entry.contentRect.width,
            });
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            areaSeriesRef.current = null;
            smaSeriesRef.current = null;
        };
    }, [height, period, seriesStyle, showSma, processedCandles, smaData]);

    const latestCandle =
        hoveredCandle ??
        (processedCandles.length > 0
            ? processedCandles[processedCandles.length - 1]
            : null);

    return (
        <div id="candlestick-chart" className="relative overflow-hidden">
            <div className="chart-header">
                <div className="flex-1">{children}</div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Chart Style & SMA Controls */}
                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#060a13] p-1">
                        <button
                            type="button"
                            onClick={() => setSeriesStyle('candles')}
                            title="OHLC Candlestick Chart"
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                seriesStyle === 'candles'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <BarChart2 size={13} />
                            <span>OHLC</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSeriesStyle('area')}
                            title="Gradient Area Chart"
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                seriesStyle === 'area'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <TrendingUp size={13} />
                            <span>Area</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowSma((prev) => !prev)}
                            title="Toggle 7-Period Simple Moving Average"
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                showSma
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Activity size={13} />
                            <span>SMA-7</span>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                chartRef.current?.timeScale().fitContent()
                            }
                            title="Reset Chart Zoom"
                            className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <Maximize2 size={13} />
                        </button>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#060a13] p-1">
                        {PERIOD_BUTTONS.map(({ value, label }) => {
                            const periodValue = value as Period;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    className={
                                        period === periodValue
                                            ? 'rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950 transition'
                                            : 'rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white'
                                    }
                                    onClick={() =>
                                        handlePeriodChange(periodValue)
                                    }
                                    disabled={isPending}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {liveInterval && setLiveInterval && (
                        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#060a13] p-1">
                            <span className="px-2 text-[11px] font-medium text-slate-400">
                                Tick:
                            </span>
                            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={
                                        liveInterval === value
                                            ? 'rounded-lg bg-cyan-500 px-2 py-1 text-xs font-bold text-slate-950'
                                            : 'rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white'
                                    }
                                    onClick={() => setLiveInterval(value)}
                                    disabled={isPending}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Live OHLC Crosshair Telemetry Bar */}
            {latestCandle && (
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.05] bg-black/25 px-3.5 py-2 font-mono text-xs">
                    <span className="text-slate-400">
                        O:{' '}
                        <strong className="text-slate-200">
                            {formatCurrency(latestCandle.open)}
                        </strong>
                    </span>
                    <span className="text-slate-400">
                        H:{' '}
                        <strong className="text-emerald-400">
                            {formatCurrency(latestCandle.high)}
                        </strong>
                    </span>
                    <span className="text-slate-400">
                        L:{' '}
                        <strong className="text-rose-400">
                            {formatCurrency(latestCandle.low)}
                        </strong>
                    </span>
                    <span className="text-slate-400">
                        C:{' '}
                        <strong className="text-white">
                            {formatCurrency(latestCandle.close)}
                        </strong>
                    </span>
                    {showSma && (
                        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-cyan-400">
                            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                            SMA(7) Active
                        </span>
                    )}
                </div>
            )}

            <div
                ref={chartContainerRef}
                className="chart overflow-hidden rounded-xl border border-white/[0.05]"
                style={{ height }}
            />
        </div>
    );
};

export default CandlestickChart;
