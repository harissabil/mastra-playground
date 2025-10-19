import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const budgetAnalyzerTool = createTool({
    id: 'analyze-budget',
    description: 'Analyze monthly budget and spending patterns. Provides recommendations based on the 50/30/20 rule (50% needs, 30% wants, 20% savings).',
    inputSchema: z.object({
        monthlyIncome: z.number().describe('Total monthly income after tax'),
        needs: z.number().describe('Essential expenses: rent, utilities, groceries, insurance, etc.'),
        wants: z.number().describe('Non-essential expenses: entertainment, dining out, hobbies, etc.'),
        savings: z.number().describe('Amount saved or invested'),
    }),
    outputSchema: z.object({
        totalIncome: z.number(),
        totalExpenses: z.number(),
        totalSavings: z.number(),
        remainingBalance: z.number(),
        percentages: z.object({
            needs: z.number(),
            wants: z.number(),
            savings: z.number(),
        }),
        idealBudget: z.object({
            needs: z.number(),
            wants: z.number(),
            savings: z.number(),
        }),
        recommendations: z.array(z.string()),
        status: z.enum(['excellent', 'good', 'needs-improvement', 'critical']),
    }),
    execute: async ({ context }) => {
        return analyzeBudget(
            context.monthlyIncome,
            context.needs,
            context.wants,
            context.savings
        );
    },
});

const analyzeBudget = (
    monthlyIncome: number,
    needs: number,
    wants: number,
    savings: number
) => {
    const totalExpenses = needs + wants;
    const remainingBalance = monthlyIncome - totalExpenses - savings;

    // Calculate percentages
    const needsPercent = Math.round((needs / monthlyIncome) * 10000) / 100;
    const wantsPercent = Math.round((wants / monthlyIncome) * 10000) / 100;
    const savingsPercent = Math.round((savings / monthlyIncome) * 10000) / 100;

    // Calculate ideal 50/30/20 budget
    const idealNeeds = Math.round(monthlyIncome * 0.5 * 100) / 100;
    const idealWants = Math.round(monthlyIncome * 0.3 * 100) / 100;
    const idealSavings = Math.round(monthlyIncome * 0.2 * 100) / 100;

    // Generate recommendations
    const recommendations: string[] = [];

    if (needsPercent > 50) {
        const excess = needs - idealNeeds;
        recommendations.push(
            `Your essential expenses (${needsPercent}%) exceed the recommended 50%. Try to reduce by ${Math.round(excess)} to meet the ideal budget.`
        );
    }

    if (wantsPercent > 30) {
        const excess = wants - idealWants;
        recommendations.push(
            `Your discretionary spending (${wantsPercent}%) is above the recommended 30%. Consider cutting ${Math.round(excess)} from non-essential expenses.`
        );
    }

    if (savingsPercent < 20) {
        const shortage = idealSavings - savings;
        recommendations.push(
            `Your savings rate (${savingsPercent}%) is below the recommended 20%. Try to save an additional ${Math.round(shortage)} per month.`
        );
    }

    if (remainingBalance < 0) {
        recommendations.push(
            `⚠️ WARNING: You're spending ${Math.abs(remainingBalance)} more than you earn! Immediate action needed to avoid debt.`
        );
    }

    if (savingsPercent >= 20 && needsPercent <= 50 && wantsPercent <= 30) {
        recommendations.push('🎉 Excellent! Your budget follows the 50/30/20 rule perfectly.');
    }

    if (remainingBalance > 0 && recommendations.length === 0) {
        recommendations.push(
            `Great job! You have ${Math.round(remainingBalance)} left over. Consider increasing your savings or investments.`
        );
    }

    // Determine status
    let status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
    if (remainingBalance < 0) {
        status = 'critical';
    } else if (savingsPercent >= 20 && needsPercent <= 55 && wantsPercent <= 35) {
        status = 'excellent';
    } else if (savingsPercent >= 15 && needsPercent <= 60) {
        status = 'good';
    } else {
        status = 'needs-improvement';
    }

    return {
        totalIncome: monthlyIncome,
        totalExpenses,
        totalSavings: savings,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
        percentages: {
            needs: needsPercent,
            wants: wantsPercent,
            savings: savingsPercent,
        },
        idealBudget: {
            needs: idealNeeds,
            wants: idealWants,
            savings: idealSavings,
        },
        recommendations,
        status,
    };
};