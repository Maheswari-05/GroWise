/* ============================================================
   ASSIGNMENTS DATA — 3 sample assignments (2 Math, 1 Science)
============================================================ */

let _nextId = 8;
export const generateId = () => `asgn${_nextId++}`;

/* Each submission entry:
   { studentId, name, rollNo, avatar, submittedOn, score, maxScore, status }
   status: "reviewed" | "submitted" | "missing" | "pending"
*/

export const initialAssignments = [
  /* ══ Mathematics — Batch A ══ */
  {
    id: "asgn1",
    title: "Chapter 3 Worksheet",
    subject: "Mathematics",
    batch: "Batch A",
    batchId: "b1",
    grade: "Grade 10",
    description: "Complete all 20 problems from Chapter 3 on Quadratic Equations. Show all working steps clearly.",
    dueDate: "2026-07-04",
    maxMarks: 20,
    attachmentName: "ch3_worksheet.pdf",
    createdDate: "Jul 1, 2026",
    submissions: [
      { studentId: "s01", name: "Priya Sharma", rollNo: "A-01", avatar: null, submittedOn: "Jul 4", score: 20, status: "reviewed"  },
      { studentId: "s02", name: "Aryan Patel",  rollNo: "A-02", avatar: null, submittedOn: "Jul 7", score: 12, status: "reviewed"  },
    ],
  },
  {
    id: "asgn2",
    title: "Geometry Problems",
    subject: "Mathematics",
    batch: "Batch A",
    batchId: "b1",
    grade: "Grade 10",
    description: "Solve 15 problems on Triangles and Circles. Label all diagrams clearly and state the theorems used.",
    dueDate: "2026-07-30",
    maxMarks: 20,
    attachmentName: "geometry_problems.pdf",
    createdDate: "Jul 22, 2026",
    submissions: [
      { studentId: "s01", name: "Priya Sharma", rollNo: "A-01", avatar: null, submittedOn: "Jul 28", score: null, status: "submitted" },
      { studentId: "s02", name: "Aryan Patel",  rollNo: "A-02", avatar: null, submittedOn: null,     score: null, status: "missing"   },
    ],
  },

  /* ══ Science — Batch C ══ */
  {
    id: "asgn3",
    title: "Lab Report 1",
    subject: "Science",
    batch: "Batch C",
    batchId: "b2",
    grade: "Grade 9",
    description: "Write a structured lab report for Experiment 1 (Testing for Starch). Include aim, method, observations, and conclusion.",
    dueDate: "2026-07-05",
    maxMarks: 20,
    attachmentName: "lab_report_template.docx",
    createdDate: "Jul 1, 2026",
    submissions: [
      { studentId: "s03", name: "Rohan Gupta", rollNo: "C-01", avatar: null, submittedOn: "Jul 5", score: 20, status: "reviewed" },
      { studentId: "s04", name: "Kavya Reddy", rollNo: "C-02", avatar: null, submittedOn: "Jul 8", score: 13, status: "reviewed" },
    ],
  },
];


/* ── Helpers ─────────────────────────────────────────────── */
export const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", batch: "Batch A", batchId: "b1", grade: "Grade 10", color: "blue" },
  { id: "science",     label: "Science",     batch: "Batch C", batchId: "b2", grade: "Grade 9",  color: "green" },
];

/* Students per batch (for creating new assignment submissions skeleton) */
export const BATCH_STUDENTS = {
  b1: [
    { studentId: "s01", name: "Priya Sharma", rollNo: "A-01", avatar: null },
    { studentId: "s02", name: "Aryan Patel",  rollNo: "A-02", avatar: null },
  ],
  b2: [
    { studentId: "s03", name: "Rohan Gupta",  rollNo: "C-01", avatar: null },
    { studentId: "s04", name: "Kavya Reddy",  rollNo: "C-02", avatar: null },
  ],
};

/* Compute a displayable status for an assignment */
export const assignmentStatus = (asgn) => {
  const today   = new Date(); today.setHours(0,0,0,0);
  const due     = new Date(asgn.dueDate); due.setHours(0,0,0,0);
  const allDone = asgn.submissions.every(s => s.status === "reviewed");
  if (allDone) return "completed";
  if (due < today) return "overdue";
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays <= 2) return "due-soon";
  return "active";
};

export const dueDateLabel = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(dateStr); due.setHours(0,0,0,0);
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: "#ef4444" };
  if (diff === 0) return { text: "Due today",   color: "#f97316" };
  if (diff === 1) return { text: "Due tomorrow", color: "#f97316" };
  if (diff <= 7)  return { text: `Due in ${diff}d`, color: "#2D6BFF" };
  return {
    text: `Due ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    color: "#64748b",
  };
};
