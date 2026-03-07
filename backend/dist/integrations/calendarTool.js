import { OAuthManager } from './oauthManager.js';
import { z } from 'zod';
export const CalendarTool = {
    list_events: {
        name: 'calendar_list_events',
        description: 'Lists upcoming Google Calendar events.',
        schema: z.object({
            maxResults: z.number().optional().default(10),
        }),
        execute: async ({ maxResults }, userId) => {
            const accessToken = await OAuthManager.getValidAccessToken(userId);
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(`Calendar API Error: ${data.error?.message}`);
            return {
                events: (data.items || []).map((event) => ({
                    id: event.id,
                    summary: event.summary,
                    start: event.start.dateTime || event.start.date,
                    end: event.end.dateTime || event.end.date,
                    location: event.location,
                })),
            };
        },
    },
    create_event: {
        name: 'calendar_create_event',
        description: 'Creates a new Google Calendar event.',
        requiresConfirmation: true, // Mark as sensitive
        schema: z.object({
            summary: z.string(),
            start: z.string().describe('ISO format date-time string'),
            end: z.string().describe('ISO format date-time string'),
            location: z.string().optional(),
            description: z.string().optional(),
        }),
        execute: async (args, userId) => {
            const accessToken = await OAuthManager.getValidAccessToken(userId);
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: args.summary,
                    start: { dateTime: args.start },
                    end: { dateTime: args.end },
                    location: args.location,
                    description: args.description,
                }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(`Calendar API Error: ${data.error?.message}`);
            return {
                success: true,
                eventId: data.id,
                link: data.htmlLink,
            };
        },
    },
    delete_event: {
        name: 'calendar_delete_event',
        description: 'Deletes a Google Calendar event.',
        requiresConfirmation: true,
        schema: z.object({
            eventId: z.string(),
        }),
        execute: async ({ eventId }, userId) => {
            const accessToken = await OAuthManager.getValidAccessToken(userId);
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok && response.status !== 204) {
                const data = await response.json();
                throw new Error(`Calendar API Error: ${data.error?.message}`);
            }
            return { success: true, message: `Event ${eventId} deleted.` };
        },
    },
};
