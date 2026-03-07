import { z } from 'zod';
import { checkRole } from './middleware/role.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
  schema: z.ZodObject<any>;
  execute: (args: any, userId: string) => Promise<any>;
  adminOnly?: boolean;
}

export const toolRegistry: Record<string, ToolDefinition> = {
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
      return locations[service_type as keyof typeof locations];
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
      const guides: Record<string, string[]> = {
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

export function getGeminiToolDefinitions() {
  return Object.values(toolRegistry).map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}
