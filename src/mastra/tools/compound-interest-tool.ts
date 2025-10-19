import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const compoundInterestTool = createTool({
    id: 'calculate-compound-interest',
    description: 'Calculate compound interest for investments or savings. Shows how money grows over time with different compounding frequencies.',
    inputSchema: z.object({
        principal: z.number().describe('Initial investment amount'),
        annualRate: z.number().describe('Annual interest rate as a percentage (e.g., 5 for 5%)'),
        years: z.number().describe('Number of years'),
        compoundingFrequency: z.enum(['daily', 'monthly', 'quarterly', 'yearly']).describe('How often interest is compounded'),
        monthlyContribution: z.number().optional().describe('Optional: Additional monthly contribution'),
    }),
    outputSchema: z.object({
        principal: z.number(),
        totalContributions: z.number(),
        interestEarned: z.number(),
        finalAmount: z.number(),
        effectiveRate: z.number(),
        breakdown: z.array(z.object({
            year: z.number(),
            balance: z.number(),
            interestEarned: z.number(),
        })),
    }),
    execute: async ({ context }) => {
        return calculateCompoundInterest(
            context.principal,
            context.annualRate,
            context.years,
            context.compoundingFrequency,
            context.monthlyContribution || 0
        );
    },
});

const calculateCompoundInterest = (
    principal: number,
    annualRate: number,
    years: number,
    compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'yearly',
    monthlyContribution: number
) => {
    // Get compounding periods per year
    const periodsPerYear = {
        daily: 365,
        monthly: 12,
        quarterly: 4,
        yearly: 1,
    }[compoundingFrequency];

    const rateDecimal = annualRate / 100;
    const ratePerPeriod = rateDecimal / periodsPerYear;
    const totalPeriods = years * periodsPerYear;

    // Calculate with monthly contributions
    let balance = principal;
    let totalContributions = principal;
    const breakdown: Array<{ year: number; balance: number; interestEarned: number }> = [];

    for (let year = 1; year <= years; year++) {
        const periodsInYear = periodsPerYear;
        let yearStartBalance = balance;

        for (let period = 0; period < periodsInYear; period++) {
            // Apply interest
            balance = balance * (1 + ratePerPeriod);

            // Add monthly contribution if it's a month boundary
            if (compoundingFrequency !== 'daily' || period % (365 / 12) === 0) {
                if (monthlyContribution > 0 && period % (periodsPerYear / 12) === 0) {
                    balance += monthlyContribution;
                    totalContributions += monthlyContribution;
                }
            }
        }

        const interestThisYear = balance - yearStartBalance - (monthlyContribution * 12);
        breakdown.push({
            year,
            balance: Math.round(balance * 100) / 100,
            interestEarned: Math.round(interestThisYear * 100) / 100,
        });
    }

    const finalAmount = Math.round(balance * 100) / 100;
    const interestEarned = Math.round((finalAmount - totalContributions) * 100) / 100;
    const effectiveRate = Math.round(((finalAmount / totalContributions - 1) / years) * 10000) / 100;

    return {
        principal,
        totalContributions: Math.round(totalContributions * 100) / 100,
        interestEarned,
        finalAmount,
        effectiveRate,
        breakdown,
    };
};