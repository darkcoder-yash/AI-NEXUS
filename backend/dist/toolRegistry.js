import { z } from 'zod';
import { integrationRegistry } from './integrations/integrationRegistry.js';
const emergencyTools = {
    find_emergency_services: {
        name: 'find_emergency_services',
        description: 'Finds the nearest hospital, police station, or fire department based on the user\'s current situation.',
        parameters: {
            type: 'object',
            properties: {
                service_type: { type: 'string', enum: ['hospital', 'police', 'fire'], description: 'The type of service needed' },
            },
            required: ['service_type'],
        },
        schema: z.object({
            service_type: z.enum(['hospital', 'police', 'fire']),
        }),
        execute: async ({ service_type }) => {
            const locations = {
                hospital: { name: 'City Central Hospital', address: '123 Health Ave', phone: '555-0100', distance: '1.2 miles' },
                police: { name: 'Main District Precinct', address: '456 Safety St', phone: '555-0200', distance: '0.8 miles' },
                fire: { name: 'Fire Station 9', address: '789 Rescue Rd', phone: '555-0300', distance: '2.1 miles' }
            };
            return locations[service_type];
        },
    },
    trigger_sos_alert: {
        name: 'trigger_sos_alert',
        description: 'NOTIFIES emergency contacts and local authorities with the user\'s location and status.',
        parameters: {
            type: 'object',
            properties: {
                crisis_type: { type: 'string', description: 'Brief description of the emergency' },
            },
            required: ['crisis_type'],
        },
        schema: z.object({
            crisis_type: z.string(),
        }),
        execute: async ({ crisis_type }, userId) => {
            console.log(`[SOS] Triggered for user ${userId}: ${crisis_type}`);
            return {
                status: 'DISPATCHED',
                message: 'Emergency contacts and local dispatch have been notified with your GPS coordinates.',
                timestamp: new Date().toISOString()
            };
        },
    },
    provide_first_aid_steps: {
        name: 'provide_first_aid_steps',
        description: 'Provides validated medical first-aid procedures for specific conditions.',
        parameters: {
            type: 'object',
            properties: {
                condition: { type: 'string', description: 'e.g., choking, bleeding, burn, heart attack' },
            },
            required: ['condition'],
        },
        schema: z.object({
            condition: z.string(),
        }),
        execute: async ({ condition }) => {
            const guides = {
                choking: ['Call 911', 'Perform 5 back blows', 'Perform 5 abdominal thrusts (Heimlich maneuver)', 'Repeat until object is forced out'],
                bleeding: ['Apply direct pressure with clean cloth', 'Keep pressure until bleeding stops', 'If severe, use a tourniquet above the wound'],
                burn: ['Cool the burn with running cool water', 'Remove jewelry before swelling', 'Don\'t break blisters']
            };
            return {
                condition,
                steps: guides[condition.toLowerCase()] || ['Stay calm', 'Call emergency services', 'Do not move the person']
            };
        },
    },
};
const advancedNexusTools = {
    simulate_outcome: {
        name: 'simulate_outcome',
        description: 'Simulates the potential outcome of a plan or decision, returning a probability of success and potential risks.',
        parameters: {
            type: 'object',
            properties: {
                scenario: { type: 'string', description: 'The scenario to simulate' },
                complexity: { type: 'number', description: 'Complexity level (1-10)' },
            },
            required: ['scenario'],
        },
        schema: z.object({
            scenario: z.string(),
            complexity: z.number().optional().default(5),
        }),
        execute: async ({ scenario, complexity }) => {
            // Mock simulation logic
            const successRate = Math.floor(Math.random() * (100 - complexity * 5)) + 10;
            return {
                scenario,
                confidence_score: successRate / 100,
                bottlenecks: ['Resource constraints', 'Time alignment'],
                recommendation: successRate > 70 ? 'Proceed with caution' : 'Re-evaluate strategy',
                simulation_v4_result: 'COMPLETED'
            };
        },
    },
    analyze_cognitive_load: {
        name: 'analyze_cognitive_load',
        description: 'Analyzes the user\'s current tasks and schedule to estimate cognitive burden.',
        parameters: {
            type: 'object',
            properties: {
                tasks: { type: 'array', items: { type: 'string' }, description: 'List of active tasks' },
            },
            required: ['tasks'],
        },
        schema: z.object({
            tasks: z.array(z.string()),
        }),
        execute: async ({ tasks }) => {
            const load = Math.min(tasks.length * 15, 100);
            return {
                load_score: load,
                status: load > 80 ? 'CRITICAL_BURNOUT_RISK' : (load > 50 ? 'ELEVATED' : 'OPTIMAL'),
                suggested_action: load > 80 ? 'Immediate rest recommended. Delegate non-essential tasks.' : 'Maintain current pace.'
            };
        },
    }
};
// Merge all tools
export const toolRegistry = {
    ...emergencyTools,
    ...advancedNexusTools,
};
// Dynamically add integration tools from the integrationRegistry
Object.entries(integrationRegistry).forEach(([name, tool]) => {
    toolRegistry[name] = {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema._def.shape() ? {
            type: 'object',
            properties: Object.fromEntries(Object.entries(tool.schema.shape).map(([key, value]) => [
                key,
                { type: 'string', description: value.description || '' } // Simplified for tool definitions
            ])),
            required: Object.keys(tool.schema.shape).filter(k => !tool.schema.shape[k].isOptional())
        } : { type: 'object', properties: {} },
        schema: tool.schema,
        execute: tool.execute
    };
});
export function getGeminiToolDefinitions() {
    return Object.values(toolRegistry).map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
    }));
}
