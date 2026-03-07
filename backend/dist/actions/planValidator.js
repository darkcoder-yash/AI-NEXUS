import { toolRegistry } from '../toolRegistry.js';
import { z } from 'zod';
const MAX_STEPS = 10;
export class PlanValidator {
    /**
     * Validates the plan structure and tool availability.
     * Also performs argument validation against tool schemas.
     */
    static validate(steps) {
        if (!Array.isArray(steps)) {
            throw new Error('Plan must be an array of steps.');
        }
        if (steps.length === 0) {
            throw new Error('Plan cannot be empty.');
        }
        if (steps.length > MAX_STEPS) {
            throw new Error(`Plan exceeds maximum step limit of ${MAX_STEPS}.`);
        }
        const validatedSteps = [];
        for (const step of steps) {
            this.validateStepSchema(step);
            const tool = toolRegistry[step.toolName];
            if (!tool) {
                throw new Error(`Invalid tool name: ${step.toolName}. Not found in registry.`);
            }
            // Validate arguments against tool's Zod schema
            try {
                tool.schema.parse(step.arguments);
            }
            catch (error) {
                throw new Error(`Invalid arguments for tool ${step.toolName}: ${error.message}`);
            }
            validatedSteps.push({
                id: step.id || Math.random().toString(36).substring(7),
                description: step.description,
                toolName: step.toolName,
                arguments: step.arguments,
                requiresConfirmation: !!step.requiresConfirmation,
                status: 'pending',
                retryCount: 0,
            });
        }
        // Check for obvious recursive loops (simplistic check for now)
        this.checkForRecursiveLoops(validatedSteps);
        return validatedSteps;
    }
    static validateStepSchema(step) {
        const schema = z.object({
            id: z.string().optional(),
            description: z.string(),
            toolName: z.string(),
            arguments: z.record(z.any()),
            requiresConfirmation: z.boolean().optional(),
        });
        schema.parse(step);
    }
    static checkForRecursiveLoops(steps) {
        // This is a placeholder for more advanced cycle detection if needed.
        // Basic multi-step deterministic action execution usually doesn't have loops.
        // If loops are needed, a specialized engine is required.
    }
}
