PHASE 1 — Define MVP Scope (Before Writing Code)
MVP Goal (Strictly Limited)
Build ONLY:
User Signup/Login


Create Workspace via AI prompt


AI generates:


Project


Epics


Stories


Sprint 1


Show Kanban Board


Basic status movement (drag & drop)


That’s it.
❌ No Slack
 ❌ No Jira
 ❌ No analytics
 ❌ No adaptive workflow
Keep MVP clean.

PHASE 2 — Choose Tech Stack (Production-Ready but Simple)
Recommended Stack
Layer
Tech
Frontend
Next.js (React + TypeScript)
Backend
Node.js (Express or Next API routes)
Database
PostgreSQL
ORM
Prisma
Auth
Clerk or NextAuth
AI
OpenAI API
Hosting
Vercel (frontend) + Railway/Supabase (DB)


Why This Stack?
Fast to build


Scalable


AI-friendly


Large ecosystem


Easy deployment


Investors like it


Avoid Java for MVP (too heavy).

🖥 PHASE 3 — Setup Development Environment
1️⃣ Install Base Tools
Install:
Node.js (LTS)


PostgreSQL


Git


VS Code


Postman (API testing)


Check versions:
node -v
npm -v
psql --version


2️⃣ Create Project
npx create-next-app@latest ai-pm
cd ai-pm

Select:
TypeScript ✅


App Router ✅


Tailwind CSS ✅


ESLint ✅



3️⃣ Install Core Dependencies
npm install prisma @prisma/client
npm install openai
npm install axios
npm install zod
npm install react-beautiful-dnd

Initialize Prisma:
npx prisma init


🗄 PHASE 4 — Database Schema (MVP Version)
In schema.prisma:
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  workspaces Workspace[]
}

model Workspace {
  id        String   @id @default(uuid())
  name      String
  projects  Project[]
  userId    String
}

model Project {
  id        String   @id @default(uuid())
  name      String
  epics     Epic[]
  workspaceId String
}

model Epic {
  id        String   @id @default(uuid())
  title     String
  stories   Story[]
  projectId String
}

model Story {
  id        String   @id @default(uuid())
  title     String
  status    String   @default("TODO")
  sprintId  String?
  epicId    String
}

model Sprint {
  id        String   @id @default(uuid())
  name      String
  projectId String
}

Run:
npx prisma migrate dev --name init


🤖 PHASE 5 — AI Service Setup
Create:
/lib/ai.ts

Example:
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProject(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI project planner. Return structured JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content!);
}

Use Zod to validate structure.

🧩 PHASE 6 — Build Zero-Config Flow
Flow:
User enters:


 “Build fintech mobile app with 6 engineers”



Backend:


Calls AI


Gets structured JSON


Saves to DB


Redirect to:
 /workspace/[id]/board



🎨 PHASE 7 — MVP UI Structure
Pages
/login
/dashboard
/create
/workspace/[id]/board


Kanban Columns (MVP)
TODO


IN_PROGRESS


DONE


Use:
react-beautiful-dnd

Basic drag + update status API.

🚀 PHASE 8 — Deployment
1️⃣ Push to GitHub
git init
git add .
git commit -m "MVP"

2️⃣ Deploy Frontend
Use:
Vercel


3️⃣ Deploy DB
Use:
Supabase or Railway


Set environment variables:
DATABASE_URL


OPENAI_API_KEY



🧪 PHASE 9 — Test MVP Internally
Test:
Multiple workspaces


Large prompts


Invalid AI JSON


Drag drop update


DB persistence



⏱ Realistic MVP Timeline
If solo:
Week
Goal
Week 1
Setup + DB + Auth
Week 1
Zero-Config AI
Week 2
Kanban Board
Week 2
Polish + Deploy


🧠 Critical Founder Advice
Do NOT:
Overbuild UI


Add analytics early


Add integrations


Add complex AI


MVP = Proof of Magic
Magic = “I typed one sentence and my project was created.”

💰 Cost Estimate (MVP)
Service
Cost
OpenAI API
$20–50
Supabase
Free tier
Vercel
Free
Domain
$10

You can build MVP under $100.


If you want next, I can:
Create exact folder structure


Give you AI JSON prompt template


Provide Kanban component code


Design clean Figma layout guide


Create investor demo flow

