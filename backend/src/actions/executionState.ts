export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting_for_confirmation';

export interface ActionStep {
  id: string;
  description: string;
  toolName: string;
  arguments: Record<string, any>;
  requiresConfirmation: boolean;
  status: StepStatus;
  result?: any;
  error?: string;
  retryCount: number;
  duration?: number;
  startTime?: number;
}

export interface ExecutionState {
  planId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  steps: ActionStep[];
  currentStepIndex: number;
  overallStartTime?: number;
  overallEndTime?: number;
  summary?: string;
}

export interface PlanUpdate {
  stepId: string;
  status: StepStatus;
  result?: any;
  error?: string;
  duration?: number;
}
