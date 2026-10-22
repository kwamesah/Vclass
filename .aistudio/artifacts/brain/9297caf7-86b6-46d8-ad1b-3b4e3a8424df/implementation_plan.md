# Lesson Notes Submission, AI Planning & Headmaster Approval System

Production-grade Ghana NaCCA & Montessori-aligned lesson notes management suite with a standard official Headmaster account (no demo account switchers), secure credential authentication, AI-assisted lesson planning, Word/PDF file attachments, and Headmaster review and endorsement.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed through user feedback and govern the implementation:

- **Confirmed Decision 1 (Standard Production Authentication — No Switchers)**:
  - **No profile switchers or demo account buttons**: Remove all simulated account switchers and demo dropdowns.
  - **Standard Real Authentication**: Standard production login using official credentials (Email / Staff ID + Password).
  - **Headmaster Account**: `headmaster@salemmontessori.edu.gh` (Staff ID: `HDM-SALEM-01`), granting administrative authority and Head of School oversight.
- **Confirmed Decision 2 (Submission Format)**: Hybrid model. Teachers fill out a structured Ghana NaCCA / Montessori lesson template (Strand, Sub-strand, Content Standard, Performance Indicators, Core Competencies, 3-Phase Teaching Activities, Assessment) and can attach Word (`.doc`, `.docx`) or PDF (`.pdf`) documents.
- **Confirmed Decision 3 (AI Assistance Scope)**: Full Draft Generator powered by Gemini (`gemini-3.8-flash`). Automatically drafts complete lesson plans including behavioral objectives, 21st-century core competencies, Phase 1 Starter, Phase 2 Main Teaching/Learning Activities, Phase 3 Reflection/Closure, and diagnostic evaluation questions tailored to class level and subject.
- **Confirmed Decision 4 (Headmaster Review Workflow)**: Three-way decision gateway. The Headmaster can **Approve** (with official digital administrative endorsement stamp and remarks), **Request Revision** (with specific teacher guidance comments), or **Reject** (with reasons), automatically dispatching notifications and activity logs to the teacher.

---

## 1. Overview & Core Concept

### What It Does
The Lesson Notes Suite provides an authentic, production-grade academic preparation workflow for Salem Montessori School:
1. **Standard Production Access Control**:
   - Clean, secure login experience. Users log in with their assigned school email and password.
   - Headmaster logs in via `headmaster@salemmontessori.edu.gh` and accesses the executive academic management suite.
   - Teachers log in with their credentials and access their assigned classes, subjects, and lesson planning workspace.
2. **Teacher Workspace ("Lesson Notes & AI Planner")**:
   - Fast AI-assisted generation aligned with Ghana NaCCA & Montessori standards.
   - Form for objectives, competencies, materials, and 3-phase teaching activities.
   - Document uploader supporting Microsoft Word (`.docx`, `.doc`) and Adobe PDF (`.pdf`) with file preview and download.
   - Draft saving, status tracking, and submission directly to the Headmaster.
3. **Headmaster Review & Endorsement Hub**:
   - Centralized review table filtering submissions by Status (`Pending`, `Approved`, `Needs Revision`, `Rejected`), Class, Subject, and Week.
   - Detail modal to inspect structured plans and examine attached Word/PDF files.
   - Review actions: **Approve & Stamp**, **Request Revisions**, or **Reject**.
4. **Teacher Notification & Revision Loop**:
   - Submissions alert the Headmaster; review outcomes notify the submitting teacher in their portal with actionable remarks.

### Target Audience & Roles
- **The Headmaster / Principal** (`headmaster@salemmontessori.edu.gh`): Chief academic executive responsible for curriculum delivery quality assurance and certifying weekly teacher preparedness.
- **Subject & Class Teachers**: Prepare weekly lesson plans, leverage AI draft assistance, upload formatted Word/PDF notes, and respond to Headmaster feedback.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Standard Authentication (No Demo Switchers)
```
[Production Login Page / Modal]
         │
         ├──> User enters Email (e.g. headmaster@salemmontessori.edu.gh) & Password
         ├──> System authenticates against database / user registry
         └──> Redirects to corresponding workspace (Headmaster Executive Portal)
```

#### Flow B: Teacher AI Lesson Generation & Submission
```
[Teacher Portal] ──> [Lesson Notes Tab] ──> [Click "New Lesson Note" or "AI Assist"]
         │
         ├──> [Select Class (e.g. Basic 7), Subject (Computing), Week #, Topic]
         ├──> [Click "Generate with AI"] ──> Gemini outputs full structured NaCCA note
         ├──> [Teacher reviews/tweaks: Objectives, Competencies, 3 Phases, Exercises]
         ├──> [Upload optional Word (.docx) or PDF (.pdf) file with live badge preview]
         └──> [Save as Draft] OR [Submit to Headmaster for Approval]
                 │
                 └──> Headmaster receives notification on their review dashboard
```

#### Flow C: Headmaster Review & Endorsement
```
[Headmaster Portal] ──> [Lesson Notes Approval Hub] ──> [Filter: "Pending Review"]
         │
         ├──> [Open Lesson Note Detail Drawer / Inspection Modal]
         ├──> [Review Strand, Objectives, 3-Phase Teaching Sequence, Materials]
         ├──> [Preview / Download attached Word or PDF document]
         ├──> [Choose Action]:
         │       ├──> [Approve & Endorse] ──> Adds digital Headmaster stamp & remarks
         │       ├──> [Request Revision] ──> Submits feedback & marks "Needs Revision"
         │       └──> [Reject] ──> Marks "Rejected" with mandatory reason
         └──> Real-time notification delivered directly to the submitting teacher
```

### Visual Identity & Theme
- **Color Palette & Discipline (60-30-10)**:
  - *Canvas (60%)*: Crisp off-white (`#F8FAFC`) and white (`#FFFFFF`).
  - *Structural Surfaces (30%)*: Deep Navy/Salem Blue borders (`border-slate-200`), elevated card surfaces with subtle borders, executive slate header tags.
  - *Accent Budget (10%)*: Salem Blue (`#1E3A8A`) for primary actions, Emerald (`#059669`) for Approved seals, Amber (`#D97706`) for Pending/Revision, Purple (`#7C3AED`) for Gemini AI actions, and Crimson (`#DC2626`) for Rejections.
- **Headmaster Digital Stamp**:
  - Official circular/rectangular seal design: *"SALEM MONTESSORI SCHOOL — ACADEMIC ENDORSEMENT — APPROVED BY HEADMASTER"*, featuring the review date, reviewer name, and endorsement reference code.
- **Zero-Pill Metadata**: Clean unboxed text with middots (`·`) for dates, weeks, and subjects.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure Production Authentication — Remove All Switchers
- *Chosen Approach*:
  - Completely eliminate any floating profile switchers, demo account bars, and quick switch pills from the UI.
  - Authentication relies purely on the official login form where users enter valid credentials.
  - Standard pre-configured accounts (Headmaster, Teachers, Admins) exist cleanly in the system registry, ready for deployment.
- *Why*: User explicitly requested standard behavior without demo switchers in preparation for database connectivity and Vercel production deployment.

### Decision 2: Hybrid Lesson Note Model (Structured Form + Document Attachments)
- *Chosen Approach*: Structured digital form for Ghana NaCCA fields + drag-and-drop file uploader supporting `.pdf`, `.docx`, and `.doc` files (saved as base64 with file metadata).
- *Why*: Teachers get the best of both worlds: digital indexing + AI generation, plus the ability to attach their existing formatted Word documents or PDF handouts.

### Decision 3: Server-Side Gemini API with Resilient Offline Fallback
- *Chosen Approach*: Express server route `/api/gemini/lesson-planner` utilizing `@google/genai` (`gemini-3.8-flash`) combined with an intelligent built-in offline curriculum generator fallback.
- *Why*: Meets security guidelines without breaking if the API key is not yet configured or offline.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SALEM VCLASS PLATFORM                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   TEACHER WORKSPACE                       HEADMASTER EXECUTIVE PORTAL  │
│  ┌───────────────────────┐                ┌─────────────────────────┐  │
│  │ LessonNotesStudio.tsx │                │ LessonNotesApproval.tsx │  │
│  │ - NaCCA Form Editor   │                │ - Executive Overview    │  │
│  │ - Gemini AI Assistant │                │ - Filter by Class/Week  │  │
│  │ - Word/PDF Uploader   │                │ - Document Viewer Modal │  │
│  │ - Draft & Submit View │                │ - Approve/Revise/Reject │  │
│  └───────────┬───────────┘                │ - Official Digital Seal │  │
│              │                            └────────────┬────────────┘  │
│              │                                         │               │
│              ▼                                         ▼               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 AppContext.tsx (Global State)                    │  │
│  │  - users: User[] (Standard accounts: Headmaster, Teachers, etc.) │  │
│  │  - lessonNotes: LessonNoteSubmission[]                           │  │
│  │  - submitLessonNote(), updateLessonNote(), approveLessonNote()   │  │
│  │  - requestRevision(), rejectLessonNote()                         │  │
│  │  - Isolated notifications & activity log dispatch                │  │
│  └──────────────────┬──────────────────────────────────┬────────────┘  │
│                     │                                  │               │
│                     ▼                                  ▼               │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │       Server API Route              │  │      Persistence        │  │
│  │  POST /api/gemini/lesson-planner    │  │  - localStorage        │  │
│  │  - @google/genai (gemini-3.8-flash) │  │  - Firestore DB Sync    │  │
│  │  - Structured JSON Response         │  │  - Base64 Attachments   │  │
│  └─────────────────────────────────────┘  └─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Standard Headmaster Account Entity

```typescript
{
  id: 'user-headmaster-salem',
  name: 'Rev. Dr. Emmanuel Addo',
  email: 'headmaster@salemmontessori.edu.gh',
  role: 'admin',
  staffId: 'HDM-SALEM-01',
  phone: '+233 30 278 9010',
  password: 'password123',
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  bio: 'Headmaster & Academic Principal of Salem Montessori School. Responsible for curriculum execution, teacher lesson vetting, and academic standards.',
  isHeadmaster: true,
  title: 'Headmaster & Academic Principal'
}
```

### Data Model: `LessonNoteSubmission`

```typescript
export type LessonNoteStatus = 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'rejected';

export interface LessonNoteAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | etc.
  dataUrl: string; // base64 payload
  uploadedAt: string;
}

export interface LessonNoteSubmission {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  classLevel: string; // e.g. 'Basic 7', 'Basic 8', 'Basic 4'
  weekNumber: number;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string; // e.g. '2026/2027'
  startDate: string;
  endDate: string;
  
  // Ghana NaCCA / Montessori Curriculum Structure
  strand: string;
  subStrand: string;
  contentStandard: string;
  indicators: string[];
  coreCompetencies: string[];
  learningMaterials: string[];
  
  // 3-Phase Teaching Sequence
  phase1Starter: string;
  phase2MainActivities: string;
  phase3Reflection: string;
  assessmentRemarks: string;
  
  // File Uploads
  attachments: LessonNoteAttachment[];
  
  // Workflow & Review
  status: LessonNoteStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string; // Headmaster Name
  reviewerComments?: string;
  principalEndorsement?: {
    endorsed: boolean;
    date: string;
    stampTitle: string; // 'Head of School - Salem Montessori'
    endorsementCode: string; // e.g. 'SMS-APP-2026-W04-098'
  };
  
  createdAt: string;
  updatedAt: string;
}
```
