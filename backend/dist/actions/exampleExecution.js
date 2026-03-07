import { ActionPlanner } from './planner.js';
import { ExecutionEngine } from './executionEngine.js';
async function runExample() {
    const userId = 'user_123';
    const planner = new ActionPlanner();
    // 1. Generation Phase
    console.log('--- GENERATING PLAN ---');
    const userRequest = "Search for my latest project emails and summarize the content of the first one.";
    const steps = await planner.generatePlan(userRequest);
    // 2. Initial State Setup
    const initialState = {
        planId: `plan_${Date.now()}`,
        userId: userId,
        status: 'pending',
        steps: steps,
        currentStepIndex: 0
    };
    // 3. Execution Phase
    console.log('--- EXECUTING PLAN ---');
    const engine = new ExecutionEngine(initialState);
    const finalState = await engine.resume();
    // 4. Output Result
    console.log('\n--- FINAL RESULT ---');
    console.log(`Plan Status: ${finalState.status}`);
    console.log(`Summary: ${finalState.summary}`);
}
// Example Plan JSON structure
const examplePlanJson = {
    steps: [
        {
            id: "step1",
            description: "Search for project emails",
            toolName: "search_emails",
            arguments: { query: "project" },
            requiresConfirmation: false
        },
        {
            id: "step2",
            description: "Summarize the snippet of the first email",
            toolName: "generate_summary",
            arguments: { text: "{{step1.emails.0.snippet}}" },
            requiresConfirmation: false
        }
    ]
};
// runExample().catch(console.error);
export { examplePlanJson, runExample };
