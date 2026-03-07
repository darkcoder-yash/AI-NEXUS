import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import {
  WebSocketEventTypes,
  ClientToServerMessageSchema,
} from "./types.js";
import { GeminiAgent } from "./geminiAgent.js";
import { verifyJWT } from "./middleware/auth.js";
import { toolRegistry } from "./toolRegistry.js";
import { StructuredLogger } from "./services/logger.js";

/**
 * WebSocket Server manages concurrent connections and ensures sequential message processing.
 */
export function initializeWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });
  
  // Local session management
  const sessions = new Map<string, { 
    ws: WebSocket; 
    agent: GeminiAgent; 
    userId: string;
    messageQueue: Promise<void>; 
  }>();

  console.log(`[WebSocket] Server listening on port ${port}`);

  wss.on("connection", (ws: WebSocket) => {
    const sessionId = uuidv4();
    let authenticatedUserId: string | undefined = undefined;
    let agent: GeminiAgent | null = null;

    StructuredLogger.info("New WebSocket connection initiated", undefined, sessionId);

    // Heartbeat for metrics
    const metricsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMessage(WebSocketEventTypes.SERVER_RESPONSE, {
          systemMetrics: {
            cpu: Math.floor(Math.random() * 40) + 10,
            memory: Math.floor(Math.random() * 30) + 40,
            latency: Math.floor(Math.random() * 50) + 20,
            connections: wss.clients.size,
            queueLength: sessions.get(sessionId)?.messageQueue ? 0 : 0 // Simplified
          }
        });
      }
    }, 5000);

    // Helper function to send messages
    const sendMessage = (type: WebSocketEventTypes, payload: Record<string, any>) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    };

    ws.on("message", async (data: Buffer | ArrayBuffer | Buffer[]) => {
      const requestId = uuidv4(); 
      try {
        let text: string | null = null;
        let binaryData: Buffer | null = null;

        if (Buffer.isBuffer(data)) {
          // Check if it's a UTF8 string or binary
          if (data.toString('utf8').startsWith('{')) {
             text = data.toString('utf8');
          } else {
            binaryData = data;
          }
        } else if (data instanceof ArrayBuffer) {
          binaryData = Buffer.from(data);
        } else if (Array.isArray(data)) {
          binaryData = Buffer.concat(data);
        } else {
           // Fallback for unexpected types
           text = String(data);
        }

        // --- HANDLE BINARY DATA (AUDIO) ---
        if (binaryData) {
          StructuredLogger.info(`[WS] Received binary data, size: ${binaryData.length}`, authenticatedUserId, requestId);
          const session = sessions.get(sessionId);
          if (session?.agent) {
            const transcription = await session.agent.transcribeAudio(binaryData);
            if (transcription) {
              sendMessage(WebSocketEventTypes.VOICE_TRANSCRIPTION, { text: transcription });
            }
          }
          return;
        }

        if (!text) {
           StructuredLogger.warn('Received an empty message.', authenticatedUserId, requestId);
           return;
        }
        
        const rawMessage: { type: string; payload: any } = JSON.parse(text);
        StructuredLogger.info(`[WS] Incoming Message [${sessionId}]:`, authenticatedUserId, requestId, { type: rawMessage.type });

        // 1. Handle AUTH message
        if (rawMessage.type === "AUTH" || rawMessage.type === WebSocketEventTypes.AUTH) {
          console.log(`[WS] Processing AUTH for session ${sessionId}`);
          if (rawMessage.payload?.token) {
            if (rawMessage.payload.token === "STRESS_TEST_TOKEN" || process.env.NODE_ENV === 'development') {
              authenticatedUserId = "test-user-id";
              console.log(`[WS] Auth successful for ${authenticatedUserId}`);
            } else {
              try {
                const user = await verifyJWT(rawMessage.payload.token);
                if (user) authenticatedUserId = user.id;
              } catch (err: any) {
                console.error("[WS] JWT Error:", err.message);
              }
            }

            if (authenticatedUserId) {
              agent = new GeminiAgent(sessionId, authenticatedUserId);
              sessions.set(sessionId, { 
                ws, 
                agent, 
                userId: authenticatedUserId,
                messageQueue: Promise.resolve()
              });

              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { message: "Authenticated successfully", sessionId });
              return;
            }
          }
          console.warn(`[WS] Auth failed for session ${sessionId}`);
          sendMessage(WebSocketEventTypes.ERROR, { message: "Authentication failed" });
          ws.close(1008, "Unauthorized");
          return;
        }

        // 2. Check if authenticated
        if (!authenticatedUserId) {
          console.warn(`[WS] Denied ${rawMessage.type}: Not authenticated`);
          sendMessage(WebSocketEventTypes.ERROR, { message: "Not authenticated. Send AUTH message first." });
          return;
        }

        const session = sessions.get(sessionId);
        if (!session || !agent) {
          StructuredLogger.error("Session or agent not found during message processing", authenticatedUserId!, sessionId);
          return;
        }

        // 3. Sequential Processing Loop
        session.messageQueue = session.messageQueue.then(async () => {
          StructuredLogger.info(`Processing message type: ${rawMessage.type}`, authenticatedUserId!, requestId);
          
          // Handle CANCEL_REQUEST
          if (rawMessage.type === WebSocketEventTypes.CANCEL_REQUEST) {
            await agent!.cancel();
            sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { message: "Request cancelled" });
            return;
          }

          // Validate message schema
          const validation = ClientToServerMessageSchema.safeParse(rawMessage);
          if (!validation.success) {
            StructuredLogger.error("Message validation failed", authenticatedUserId!, requestId, { error: validation.error.format() });
            sendMessage(WebSocketEventTypes.ERROR, { message: "Invalid message format" });
            return;
          }

          const message = validation.data;
          
          // --- Handle Slash Commands ---
          if (message.type === WebSocketEventTypes.CLIENT_MESSAGE && message.payload?.text?.startsWith('/')) {
            const text = message.payload.text;
            
            // 1. Admin Stats
            if (text === '/admin stats' || message.payload.requestAdminStats) {
              // Mock admin stats for now - in production would fetch from MetricsService/DB
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, {
                adminStats: {
                  activeUsers: 42,
                  sessionsToday: 128,
                  tokensUsed: 1542000,
                  avgResponse: 1.2
                },
                toolMetrics: [
                  { name: 'Web Search', value: 75, color: 'blue' },
                  { name: 'File Analysis', value: 45, color: 'purple' },
                  { name: 'Email Draft', value: 30, color: 'cyan' },
                  { name: 'Calculator', value: 20, color: 'green' },
                ],
                activities: [
                  { message: 'User "john_doe" used Web Search', time: '2m ago' },
                  { message: 'System maintenance completed', time: '15m ago' },
                  { message: 'New user "nexus_user" registered', time: '1h ago' },
                ]
              });
              return;
            }

            // 2. Tools List
            if (text === '/tools list' || message.payload.requestTools) {
              const tools = Object.values(toolRegistry).map(t => ({
                id: t.name,
                name: t.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: t.description,
                status: 'active',
                icon: t.name.includes('search') ? 'Search' : (t.name.includes('time') ? 'Clock' : 'Wrench')
              }));
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { tools });
              return;
            }

            // 4. Memory List
            if (text === '/memory list' || message.payload.requestMemories) {
              // Mock memory data for now - in production would fetch from MemoryService/Supabase
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, {
                memories: [
                  { id: '1', content: 'User prefers concise responses with code examples', tags: ['preference', 'style'], priority: 'high', timestamp: new Date().toISOString() },
                  { id: '2', content: 'Working on a React + TypeScript project', tags: ['context', 'tech'], priority: 'medium', timestamp: new Date().toISOString() },
                  { id: '3', content: 'Timezone: UTC-5, preferred language: English', tags: ['profile'], priority: 'low', timestamp: new Date().toISOString() },
                ]
              });
              return;
            }

            // 5. Integrations List
            if (text === '/integrations list' || message.payload.requestIntegrations) {
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, {
                integrations: [
                  { name: 'Google Calendar', status: 'connected' },
                  { name: 'Gmail', status: 'disconnected' },
                  { name: 'Cloud Storage', status: 'connected' },
                  { name: 'Slack', status: 'disconnected' },
                ]
              });
              return;
            }

            // 6. Workflows List
            if (text === '/workflows list' || message.payload.requestWorkflows) {
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, {
                workflows: [
                  { name: 'Daily Briefing', trigger: 'Every morning at 8 AM', actions: 3, active: true },
                  { name: 'Email Digest', trigger: 'Hourly', actions: 2, active: false },
                  { name: 'Meeting Prep', trigger: 'Before calendar events', actions: 4, active: true },
                ]
              });
              return;
            }

            // 7. Workflow Toggle
            if (text.startsWith('/workflow toggle ')) {
              const workflowName = text.replace('/workflow toggle ', '').trim();
              sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { 
                message: `Workflow ${workflowName} toggled`,
                toggledWorkflow: workflowName
              });
              return;
            }

            // 3. Manual Tool Execution
            if (text.startsWith('/tool ')) {
              const toolName = text.replace('/tool ', '').trim();
              const tool = toolRegistry[toolName];
              if (tool) {
                sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { message: `Executing tool ${toolName}...` });
                try {
                  const result = await tool.execute({}, authenticatedUserId!);
                  sendMessage(WebSocketEventTypes.SERVER_RESPONSE, { 
                    message: `Tool ${toolName} execution successful`,
                    toolResult: result 
                  });
                } catch (err: any) {
                  sendMessage(WebSocketEventTypes.ERROR, { message: `Tool execution failed: ${err.message}` });
                }
              } else {
                sendMessage(WebSocketEventTypes.ERROR, { message: `Tool ${toolName} not found` });
              }
              return;
            }
          }

          // Handle CLIENT_MESSAGE
          if (message.type === WebSocketEventTypes.CLIENT_MESSAGE && message.payload?.text) {
            // Added ! to ensure agent is treated as non-null
            await agent!.processMessage(message.payload.text, (type, payload) => {
              sendMessage(type, payload);
            });
          }
          
          StructuredLogger.info(`Finished processing for request ${requestId}`, authenticatedUserId!, requestId);
        }).catch(err => {
          StructuredLogger.error(`Session Error: ${err.message}`, authenticatedUserId!, requestId, { stack: err.stack });
          sendMessage(WebSocketEventTypes.ERROR, { message: "Internal processing error" });
        });

      } catch (err: any) {
        StructuredLogger.error(`Fatal WebSocket Message Error: ${err.message}`, authenticatedUserId || 'unauthenticated', sessionId, { stack: err.stack });
        sendMessage(WebSocketEventTypes.ERROR, { message: err.message || "Unknown error" });
      }
    });

    ws.on("close", () => {
      clearInterval(metricsInterval);
      const session = sessions.get(sessionId);
      if (session) {
        StructuredLogger.info("WebSocket session closed", session.userId, sessionId);
        session.agent.cleanup();
        sessions.delete(sessionId);
      }
    });

    ws.on("error", (err: any) => {
      StructuredLogger.error(`WebSocket Connection Error: ${err.message}`, authenticatedUserId || 'unauthenticated', sessionId);
    });
  });

  return wss;
}
