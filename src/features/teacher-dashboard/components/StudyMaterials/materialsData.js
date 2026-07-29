/* ============================================================
   STUDY MATERIALS DATA — 3 sample materials (2 Math, 1 Science)
============================================================ */

export const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", batch: "Batch A", grade: "Grade 10", color: "blue",  icon: "📐" },
  { id: "science",     label: "Science",     batch: "Batch C", grade: "Grade 9",  color: "green", icon: "🔬" },
];

let _nextId = 4;
export const generateId = () => `m${_nextId++}`;

export const initialMaterials = [
  {
    id: "m1",
    subject: "Mathematics",
    batch: "Batch A",
    grade: "Grade 10",
    title: "Chapter 3 – Quadratic Equations",
    description: "Complete notes covering the standard form, factorisation method, completing the square, and the quadratic formula with worked examples.",
    fileType: "pdf",
    fileName: "ch3_quadratic_equations.pdf",
    fileSize: "2.4 MB",
    uploadDate: "Jul 20, 2026",
    downloads: 14,
  },
  {
    id: "m2",
    subject: "Mathematics",
    batch: "Batch A",
    grade: "Grade 10",
    title: "Geometry – Triangles & Circles (Slides)",
    description: "Presentation slides covering properties of triangles, the Pythagorean theorem, and circle theorems with diagrams.",
    fileType: "ppt",
    fileName: "geometry_triangles_circles.pptx",
    fileSize: "5.1 MB",
    uploadDate: "Jul 10, 2026",
    downloads: 9,
  },
  {
    id: "m3",
    subject: "Science",
    batch: "Batch C",
    grade: "Grade 9",
    title: "Chapter 4 – Atoms & Molecules",
    description: "Comprehensive notes on atomic structure, Dalton's atomic theory, and molecular masses with periodic table reference.",
    fileType: "pdf",
    fileName: "ch4_atoms_molecules.pdf",
    fileSize: "3.2 MB",
    uploadDate: "Jul 18, 2026",
    downloads: 10,
  },
];
