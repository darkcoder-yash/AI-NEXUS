import { useState } from 'react';

export type NovaState = 'IDLE' | 'THINKING' | 'EXECUTING' | 'SUCCESS' | 'ERROR';

export const useNovaState = () => {
  const [state, setState] = useState<NovaState>('IDLE');

  const transitionTo = (newState: NovaState) => {
    setState(newState);
  };

  return {
    state,
    transitionTo,
  };
};
