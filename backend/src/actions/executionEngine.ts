import { ExecutionState, ActionStep } from './executionState.js';
import { ActionLogger } from './actionLogger.js';
import { toolRegistry } from '../toolRegistry.js';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const MAX_RETRIES = 3;

export class ExecutionEngine {
  private state: ExecutionState;
  private client: GoogleGenAI;

  constructor(state: ExecutionState) {
    this.state = state;
    this.client = new GoogleGenAI({
      apiKey: config.GEMINI_API_KEY,
    });
  }

  async resume() {
    if (this.state.status === 'completed' || this.state.status === 'failed') {
      return this.state;
    }

    this.state.status = 'running';
    if (!this.state.overallStartTime) {
      this.state.overallStartTime = Date.now();
      ActionLogger.logPlanStart(this.state);
    }

    try {
      while (this.state.currentStepIndex < this.state.steps.length) {
        const step = this.state.steps[this.state.currentStepIndex];

        // 1. Check for confirmation
        if (step.requiresConfirmation && step.status !== 'completed' && step.status !== 'running') {
          this.state.status = 'paused';
          step.status = 'waiting_for_confirmation';
          ActionLogger.logConfirmationRequired(step.id);
          return this.state;
        }

        // 2. Execute Step
        await this.executeStep(step);

        if (step.status === 'failed') {
          this.state.status = 'failed';
          break;
        }

        this.state.currentStepIndex++;
      }

      if (this.state.status !== 'failed') {
        this.state.status = 'completed';
        this.state.summary = await this.summarizeResults();
      }
    } catch (error: any) {
      this.state.status = 'failed';
      console.error(`[ActionEngine] CRITICAL FAILURE: ${error.message}`);
    } finally {
      this.state.overallEndTime = Date.now();
      ActionLogger.logPlanComplete(this.state);
    }

    return this.state;
  }

  private async executeStep(step: ActionStep) {
    step.status = 'running';
    step.startTime = Date.now();
    ActionLogger.logStepStart(step);

    // Inject results from previous steps
    const injectedArgs = this.injectPreviousResults(step.arguments);

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const tool = toolRegistry[step.toolName];
        step.result = await tool.execute(injectedArgs, this.state.userId);
        step.status = 'completed';
        break;
      } catch (error: any) {
        attempt++;
        step.retryCount = attempt;
        ActionLogger.logRetry(step.id, attempt, error.message);
        
        if (attempt >= MAX_RETRIES) {
          step.status = 'failed';
          step.error = error.message;
        } else {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    step.duration = Date.now() - step.startTime!;
    ActionLogger.logStepResult(step);
  }

  private injectPreviousResults(args: any): any {
    const serialized = JSON.stringify(args);
    const injected = serialized.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const [stepId, ...props] = path.split('.');
      const sourceStep = this.state.steps.find(s => s.id === stepId);
      
      if (!sourceStep || sourceStep.status !== 'completed') {
        throw new Error(`Placeholder dependency not met: ${path}`);
      }

      let value = sourceStep.result;
      for (const prop of props) {
        if (value && typeof value === 'object' && prop in value) {
          value = value[prop];
        } else {
          throw new Error(`Property ${prop} not found in step result: ${stepId}`);
        }
      }

      return typeof value === 'string' ? value : JSON.stringify(value);
    });

    return JSON.parse(injected);
  }

  private async summarizeResults(): Promise<string> {
    const resultSummary = this.state.steps.map(s => ({
      description: s.description,
      status: s.status,
      result: s.result
    }));

    const prompt = `
      You are a results summarizer. Based on the following multi-step execution results, provide a clear, human-readable summary of what was accomplished.
      Results: ${JSON.stringify(resultSummary)}
    `;

    const result = await this.client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return result.text || 'No summary generated.';
  }
}
