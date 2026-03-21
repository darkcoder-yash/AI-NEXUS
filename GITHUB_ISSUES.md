# 🚀 AI-NEXUS Development Backlog

## [Enhancement] Implement Hierarchical Multi-Agent Orchestration Layer
**Title:** `feat: hierarchical-agent-orchestrator`
**Labels:** `enhancement`, `agent-layer`, `core`
**Description:**
Current agent execution is linear. We need to implement a "Supervisor" pattern where a Lead Agent can spawn sub-agents for specialized tasks (e.g., a "Coder Agent" and a "Researcher Agent") and aggregate their outputs.
**Tasks:**
- [ ] Create `AgentSupervisor` class in `backend/src/actions/`.
- [ ] Implement task decomposition logic in `planner.ts`.
- [ ] Add inter-agent communication protocols via WebSockets.
- [ ] Update `geminiAgent.ts` to support recursive task handling.

---

## [Performance] Optimize Vector Memory Retrieval with Reranking
**Title:** `perf: memory-retrieval-reranking`
**Labels:** `performance`, `memory-system`, `ai-reasoning`
**Description:**
Improve the relevance of retrieved long-term memories by implementing a two-step process: initial cosine similarity search followed by a cross-encoder reranking step.
**Tasks:**
- [ ] Integrate a lightweight cross-encoder model in `embeddingService.ts`.
- [ ] Implement `memoryScoring.ts` logic for top-k refinement.
- [ ] Benchmark retrieval latency vs. accuracy improvements.
- [ ] Update `memoryClient.ts` to handle the new scoring pipeline.

---

## [Bug] WebSocket Connection Drop on High-Volume Stream
**Title:** `fix: websocket-buffer-overflow-management`
**Labels:** `bug`, `streaming`, `critical`
**Description:**
Under heavy load (fast token generation + high-frequency UI updates), the WebSocket connection occasionally drops due to buffer saturation.
**Tasks:**
- [ ] Implement back-pressure handling in `streamManager.ts`.
- [ ] Add message batching for UI telemetry data.
- [ ] Increase heartbeat frequency and implement auto-reconnection logic.
- [ ] Debug `voiceServer.ts` synchronization during high-latency periods.

---

## [Enhancement] Expand Integration Suite: Microsoft Graph & Notion
**Title:** `feat: integration-expansion-ms-graph-notion`
**Labels:** `enhancement`, `integrations`
**Description:**
To make AI-NEXUS a true productivity hub, we need to extend the integration layer beyond Google Workspace to include Microsoft 365 and Notion.
**Tasks:**
- [ ] Create `notionTool.ts` in `backend/src/integrations/`.
- [ ] Implement OAuth2 flow for Microsoft Graph in `oauthManager.ts`.
- [ ] Map Notion database blocks to the `AgentAction` schema.
- [ ] Add UI configuration toggles in `ToolsPanel.tsx`.

---

## [Performance] R3F Component Occlusion Culling for 3D Graph
**Title:** `perf: r3f-occlusion-culling-spatial-graph`
**Labels:** `performance`, `ui-3d`
**Description:**
The `SpatialGraph3D.tsx` experiences frame drops when the node count exceeds 500. We need to implement occlusion culling or instanced rendering for nodes/links.
**Tasks:**
- [ ] Refactor `SpatialGraph3D.tsx` to use `InstancedMesh`.
- [ ] Implement frustum culling for non-visible nodes.
- [ ] Optimize `Html` label rendering using `drei`'s `<Instances />`.
- [ ] Reduce shader overhead in `QuantumCore.tsx`.

---

## [Enhancement] Self-Correction & Reflection Loop in Reasoning
**Title:** `feat: agent-self-reflection-loop`
**Labels:** `enhancement`, `ai-reasoning`
**Description:**
Add a "Reflect" step to the execution engine where the agent reviews its own proposed plan against a set of constraints before execution.
**Tasks:**
- [ ] Modify `planValidator.ts` to include an LLM-based critique step.
- [ ] Update `executionEngine.ts` to support "Retry-on-Reflection-Failure".
- [ ] Add "Thought" visualization to `ThoughtBlob.tsx` reflecting this loop.

---

## [Documentation] Comprehensive API & Integration Schema
**Title:** `docs: architecture-specification-v1`
**Labels:** `documentation`
**Description:**
Provide a detailed technical specification for how new tools can be added to the `toolRegistry.ts` and how the memory system interacts with the frontend.
**Tasks:**
- [ ] Document the `AgentAction` TypeScript interface.
- [ ] Create a "How to add a Tool" guide for the Integration Layer.
- [ ] Define the WebSocket message protocol schema.
