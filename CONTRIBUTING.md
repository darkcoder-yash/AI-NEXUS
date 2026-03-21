# Contributing to AI-NEXUS

We're thrilled that you're interested in contributing to AI-NEXUS! This project aims to build a state-of-the-art, 3D AI system that integrates advanced reasoning, long-term memory, and real-time execution.

## 🌟 How You Can Help

- **Agent Layer:** Enhance multi-agent orchestration, implement self-correction loops, or refine Gemini-based reasoning.
- **Memory System:** Optimize vector retrieval, implement new embedding strategies, or improve long-term memory scoring.
- **Frontend & 3D UI:** Work with React Three Fiber to build cinematic, spatial interfaces or optimize 3D performance.
- **Integration Layer:** Add new external tools (SaaS, local system, APIs) to the agent's capability registry.
- **Streaming:** Help with WebSocket performance, real-time data synchronization, or voice session stability.

## 🛠️ Setup Instructions

1. **Fork the Repository:** Create your own copy of the AI-NEXUS project on GitHub.
2. **Clone Locally:** 
   ```bash
   git clone https://github.com/your-username/AI-NEXUS.git
   cd AI-NEXUS
   ```
3. **Install Dependencies:**
   - **Frontend:** `cd nexus-architect-ui-main && npm install`
   - **Backend:** `cd backend && npm install`
4. **Environment Setup:** Copy `.env.example` in both directories and fill in your placeholders.
5. **Run the Project:**
   - **Frontend:** `npm run dev` (from `nexus-architect-ui-main`)
   - **Backend:** `npm start` (from `backend`)

## 🔄 Contribution Workflow

1. **Find an Issue:** Browse our GitHub Issues and comment on the one you'd like to tackle.
2. **Create a Branch:** `git checkout -b feat/your-feature-name`
3. **Implement Changes:** Follow our coding standards and ensure your logic is well-documented.
4. **Test Your Work:** Run the project locally and verify your changes don't break existing functionality.
5. **Submit a PR:** Push your branch to GitHub and open a Pull Request. Provide a clear description of your changes.

## 📜 Code Guidelines

- **TypeScript:** We use strict TypeScript across the entire stack. Ensure your types are accurate.
- **Component Architecture:** In the frontend, separate 3D logic (`nexus-ai/`) from UI HUD components.
- **Modular Services:** Keep the backend clean by modularizing logic into specialized services in `backend/src/`.
- **Consistency:** Align with the established naming conventions (e.g., Agent Layer, Memory System).

## 👋 Tone and Community

AI-NEXUS is built by and for the community. We maintain a professional, respectful, and highly innovative environment. We value technical insight and creative visual experimentation.

Welcome to the future of AI. Let's build it together.
