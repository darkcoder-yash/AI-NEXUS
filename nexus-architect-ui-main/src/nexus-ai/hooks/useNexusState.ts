import { useState } from 'react';

export type NexusState = 'IDLE' | 'THINKING' | 'EXECUTING' | 'SUCCESS' | 'ERROR';

export const useNexusState = () => {
  const [state, setState] = useState<NexusState>('IDLE');

  const transitionTo = (newState: NexusState) => {
    setState(newState);
  };

  return {
    state,
    transitionTo,
  };
};
