import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface ExchangeRateResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    conversion_rates: Record<string, number>;
}

interface ConversionResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    target_code: string;
    conversion_rate: number;
    conversion_result: number;
}

const API_KEY = process.env.EXCHANGE_RATES_API_KEY || '';

export const currencyConverterTool = createTool({
    id: 'convert-currency',
    description: 'Convert amounts between different currencies using real-time exchange rates. Supports all major world currencies.',
    inputSchema: z.object({
        amount: z.number().describe('Amount to convert'),
        fromCurrency: z.string().describe('Source currency code (e.g., USD, EUR, IDR, JPY)'),
        toCurrency: z.string().describe('Target currency code (e.g., USD, EUR, IDR, JPY)'),
    }),
    outputSchema: z.object({
        amount: z.number(),
        fromCurrency: z.string(),
        toCurrency: z.string(),
        exchangeRate: z.number(),
        convertedAmount: z.number(),
        lastUpdated: z.string(),
    }),
    execute: async ({ context }) => {
        return await convertCurrency(
            context.amount,
            context.fromCurrency.toUpperCase(),
            context.toCurrency.toUpperCase()
        );
    },
});

const convertCurrency = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
) => {
    // Use the pair conversion endpoint for more efficient API usage
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`;

    const response = await fetch(url);
    const data = (await response.json()) as ConversionResponse;

    if (data.result !== 'success') {
        throw new Error(`Currency conversion failed. Please check the currency codes.`);
    }

    return {
        amount,
        fromCurrency,
        toCurrency,
        exchangeRate: data.conversion_rate,
        convertedAmount: data.conversion_result,
        lastUpdated: data.time_last_update_utc,
    };
};

// Optional: Tool to get all available exchange rates for a base currency
export const getExchangeRatesTool = createTool({
    id: 'get-exchange-rates',
    description: 'Get all current exchange rates for a base currency. Useful when user wants to compare multiple currencies.',
    inputSchema: z.object({
        baseCurrency: z.string().describe('Base currency code (e.g., USD, EUR, IDR)'),
    }),
    outputSchema: z.object({
        baseCurrency: z.string(),
        rates: z.record(z.number()),
        lastUpdated: z.string(),
    }),
    execute: async ({ context }) => {
        return await getExchangeRates(context.baseCurrency.toUpperCase());
    },
});

const getExchangeRates = async (baseCurrency: string) => {
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`;

    const response = await fetch(url);
    const data = (await response.json()) as ExchangeRateResponse;

    if (data.result !== 'success') {
        throw new Error(`Failed to fetch exchange rates for ${baseCurrency}`);
    }

    return {
        baseCurrency,
        rates: data.conversion_rates,
        lastUpdated: data.time_last_update_utc,
    };
};