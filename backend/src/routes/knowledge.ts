import { Router } from 'express';

export const knowledgeRouter = Router();

knowledgeRouter.get('/graph', (req, res) => {
  // Simulating PGVector DB Fetch
  const nodes = [
    { id: 1, label: 'Alex Chen', type: 'Person', connections: 3 },
    { id: 2, label: 'AI NEXUS Project', type: 'Project', connections: 5 },
    { id: 3, label: 'Q1 Review', type: 'Meeting', connections: 2 },
    { id: 4, label: 'Architecture.pdf', type: 'Document', connections: 1 },
    { id: 5, label: 'Database Design', type: 'Task', connections: 2 },
    { id: 6, label: 'Sarah Jenkins', type: 'Person', connections: 4 },
    { id: 7, label: 'Supabase Integration', type: 'Task', connections: 1 },
    { id: 8, label: 'Q2 Roadmap', type: 'Document', connections: 3 },
    { id: 9, label: 'Marketing Sync', type: 'Meeting', connections: 1 },
    { id: 10, label: 'Gemini 2.5 Flash', type: 'Project', connections: 4 },
    { id: 11, label: 'User Auth Module', type: 'Task', connections: 3 },
    { id: 12, label: 'Design System', type: 'Document', connections: 2 },
  ];
  
  res.json({ nodes });
});
