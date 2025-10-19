import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GeocodingResponse {
    results: {
        latitude: number;
        longitude: number;
        name: string;
    }[];
}

interface WeatherForecastResponse {
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        apparent_temperature_max: number[];
        apparent_temperature_min: number[];
        precipitation_probability_max: number[];
        wind_speed_10m_max: number[];
        wind_gusts_10m_max: number[];
        weather_code: number[];
    };
}

interface CurrentWeatherResponse {
    current: {
        time: string;
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        wind_gusts_10m: number;
        weather_code: number;
    };
}

export const weatherWithDateTool = createTool({
    id: 'get-weather-with-date',
    description: 'Get weather forecast for a specific date and location. Use this when user asks about weather for a specific date.',
    inputSchema: z.object({
        location: z.string().describe('City name'),
        date: z.string().describe('Date in ISO format (YYYY-MM-DD)'),
    }),
    outputSchema: z.object({
        temperature: z.number().optional(),
        temperatureMax: z.number().optional(),
        temperatureMin: z.number().optional(),
        feelsLike: z.number().optional(),
        feelsLikeMax: z.number().optional(),
        feelsLikeMin: z.number().optional(),
        humidity: z.number().optional(),
        windSpeed: z.number().optional(),
        windGust: z.number().optional(),
        precipitationChance: z.number().optional(),
        conditions: z.string(),
        location: z.string(),
        date: z.string(),
        formattedDate: z.string(),
        isToday: z.boolean(),
    }),
    execute: async ({ context }) => {
        return await getWeatherForDate(context.location, context.date);
    },
});

const getWeatherForDate = async (location: string, dateStr: string) => {
    // Get location coordinates
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

    if (!geocodingData.results?.[0]) {
        throw new Error(`Location '${location}' not found`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    // Parse the date
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const isToday = targetDate.getTime() === today.getTime();
    const formattedDate = targetDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // If it's today, get current weather
    if (isToday) {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
        const response = await fetch(weatherUrl);
        const data = (await response.json()) as CurrentWeatherResponse;

        return {
            temperature: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            windGust: data.current.wind_gusts_10m,
            conditions: getWeatherCondition(data.current.weather_code),
            location: name,
            date: dateStr,
            formattedDate,
            isToday: true,
        };
    }

    // For other dates, get forecast
    // Open-Meteo provides up to 16 days forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,weather_code&timezone=auto`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as WeatherForecastResponse;

    // Find the matching date in the forecast
    const dateIndex = data.daily.time.findIndex(d => d === dateStr);

    if (dateIndex === -1) {
        throw new Error(`Weather forecast not available for ${formattedDate}. Forecasts are available for up to 16 days.`);
    }

    return {
        temperatureMax: data.daily.temperature_2m_max[dateIndex],
        temperatureMin: data.daily.temperature_2m_min[dateIndex],
        feelsLikeMax: data.daily.apparent_temperature_max[dateIndex],
        feelsLikeMin: data.daily.apparent_temperature_min[dateIndex],
        windSpeed: data.daily.wind_speed_10m_max[dateIndex],
        windGust: data.daily.wind_gusts_10m_max[dateIndex],
        precipitationChance: data.daily.precipitation_probability_max[dateIndex],
        conditions: getWeatherCondition(data.daily.weather_code[dateIndex]),
        location: name,
        date: dateStr,
        formattedDate,
        isToday: false,
    };
};

function getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return conditions[code] || 'Unknown';
}