'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownUp } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Converter = ({ symbol, icon, priceList }: ConverterProps) => {
    const [currency, setCurrency] = useState('usd');
    const [amount, setAmount] = useState('1');

    const unitPrice = priceList[currency] || 0;
    const convertedPrice = (parseFloat(amount) || 0) * unitPrice;

    return (
        <div
            id="converter"
            className="rounded-2xl border border-white/[0.08] bg-[#0a101d]/90 p-5 shadow-xl"
        >
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h4 className="text-base font-bold text-white sm:text-lg">
                        {symbol.toUpperCase()} Instant FX Converter
                    </h4>
                    <p className="text-xs text-slate-400">
                        1 {symbol.toUpperCase()} ={' '}
                        <span className="font-mono text-emerald-400">
                            {formatCurrency(unitPrice, undefined, currency)}
                        </span>
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex h-13 w-full items-center justify-between rounded-xl border border-white/10 bg-[#060a13] px-3.5">
                    <Input
                        type="number"
                        step="any"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 border-none bg-transparent! px-0 font-mono text-base font-bold text-white shadow-none focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1">
                        <Image
                            src={icon}
                            alt={symbol}
                            width={18}
                            height={18}
                            className="rounded-full"
                        />
                        <span className="font-mono text-xs font-bold text-emerald-300 uppercase">
                            {symbol}
                        </span>
                    </div>
                </div>

                <div className="relative flex items-center justify-center py-0.5">
                    <div className="h-px w-full bg-white/[0.08]" />
                    <span className="absolute flex size-8 items-center justify-center rounded-full border border-emerald-500/30 bg-[#0a101d] text-emerald-400">
                        <ArrowDownUp size={14} />
                    </span>
                </div>

                <div className="flex h-13 w-full items-center justify-between rounded-xl border border-white/10 bg-[#060a13] px-3.5">
                    <p className="font-mono text-base font-bold text-emerald-400">
                        {formatCurrency(
                            convertedPrice,
                            undefined,
                            currency,
                            false,
                        )}
                    </p>

                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger
                            className="w-fit! border border-white/10! bg-white/[0.05]! px-2.5 py-1 font-mono text-xs font-bold text-white"
                            value={currency}
                        >
                            <SelectValue placeholder="Select">
                                {currency.toUpperCase()}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            className="max-h-72 border-white/10 bg-[#0a101d] text-white"
                            data-converter
                        >
                            {Object.keys(priceList).map((currencyCode) => (
                                <SelectItem
                                    value={currencyCode}
                                    key={currencyCode}
                                    className="cursor-pointer font-mono text-xs hover:bg-emerald-500/20"
                                >
                                    {currencyCode.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Quick Preset Amounts */}
                <div className="flex gap-1.5 pt-1">
                    {['0.1', '1', '10', '100', '1000'].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`flex-1 rounded-lg border py-1 font-mono text-xs font-semibold transition ${
                                amount === val
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                            }`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Converter;
