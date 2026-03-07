export class ActionLogger {
    static logPlanStart(state) {
        console.log(`[ActionEngine] PLAN_START: ${state.planId} for user ${state.userId}`);
        console.log(`[ActionEngine] Steps count: ${state.steps.length}`);
        state.steps.forEach((step, idx) => {
            console.log(`  Step ${idx + 1}: ${step.toolName} - ${step.description}`);
        });
    }
    static logStepStart(step) {
        console.log(`[ActionEngine] STEP_START: ${step.id} (${step.toolName})`);
    }
    static logStepResult(step) {
        console.log(`[ActionEngine] STEP_COMPLETE: ${step.id} in ${step.duration}ms`);
        if (step.status === 'failed') {
            console.error(`[ActionEngine] STEP_FAILED: ${step.id}. Error: ${step.error}`);
        }
    }
    static logPlanComplete(state) {
        const duration = state.overallEndTime - state.overallStartTime;
        console.log(`[ActionEngine] PLAN_COMPLETE: ${state.planId}. Status: ${state.status}. Total duration: ${duration}ms`);
    }
    static logRetry(stepId, retryCount, error) {
        console.warn(`[ActionEngine] RETRY: ${stepId}. Attempt: ${retryCount}. Error: ${error}`);
    }
    static logConfirmationRequired(stepId) {
        console.log(`[ActionEngine] CONFIRMATION_REQUIRED: ${stepId}`);
    }
}
