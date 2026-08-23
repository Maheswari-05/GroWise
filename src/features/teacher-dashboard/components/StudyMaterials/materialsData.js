/* ============================================================
   STUDY MATERIALS DATA — 3 sample materials (2 Math, 1 Science)
============================================================ */

export const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", batch: "Batch A", grade: "Grade 10", color: "blue" },
  { id: "science",     label: "Science",     batch: "Batch C", grade: "Grade 9",  color: "green" },
];

let _nextId = 4;
export const generateId = () => `m${_nextId++}`;

export const initialMaterials = [];
