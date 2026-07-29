// Centralized mock data database for the Teacher Dashboard

export const initialBatches = [
  {
    id: "b1",
    name: "Batch A",
    grade: "Grade 10",
    subject: "Mathematics",
    totalStudents: 2,
    schedule: "Mon, Wed, Fri · 9:00 AM",
    color: "blue",
    icon: "📐",
  },
  {
    id: "b2",
    name: "Batch C",
    grade: "Grade 9",
    subject: "Science",
    totalStudents: 2,
    schedule: "Tue, Thu · 11:00 AM",
    color: "green",
    icon: "🔬",
  },
];

export const initialStudents = [
  {
    id: "s01",
    batchId: "b1",
    name: "Priya Sharma",
    rollNo: "A-01",
    grade: "Grade 10",
    email: "priya.sharma@student.com",
    phone: "+91 98765 00003",
    parent: "Mr. Raj Sharma",
    parentPhone: "+91 98765 10003",
    joinedOn: "Jun 2025",
    attendancePercent: 100,
    avgScore: 95,
    rank: 1,
    status: "active",
  },
  {
    id: "s02",
    batchId: "b1",
    name: "Aryan Patel",
    rollNo: "A-02",
    grade: "Grade 10",
    email: "aryan.patel@student.com",
    phone: "+91 98765 00004",
    parent: "Mrs. Meena Patel",
    parentPhone: "+91 98765 10004",
    joinedOn: "Jun 2025",
    attendancePercent: 78,
    avgScore: 68,
    rank: 2,
    status: "active",
  },
  {
    id: "s03",
    batchId: "b2",
    name: "Rohan Gupta",
    rollNo: "C-01",
    grade: "Grade 9",
    email: "rohan.gupta@student.com",
    phone: "+91 98765 00010",
    parent: "Mr. Suresh Gupta",
    parentPhone: "+91 98765 10010",
    joinedOn: "Jun 2025",
    attendancePercent: 100,
    avgScore: 92,
    rank: 1,
    status: "active",
  },
  {
    id: "s04",
    batchId: "b2",
    name: "Kavya Reddy",
    rollNo: "C-02",
    grade: "Grade 9",
    email: "kavya.reddy@student.com",
    phone: "+91 98765 00011",
    parent: "Mr. Srinivas Reddy",
    parentPhone: "+91 98765 10011",
    joinedOn: "Jun 2025",
    attendancePercent: 75,
    avgScore: 63,
    rank: 2,
    status: "active",
  },
];

export const initialWeeklyTests = [
  {
    id: "t1",
    title: "Mathematics - Algebra Test",
    subject: "Mathematics",
    batchId: "b1",
    date: "2026-06-12",
    maxScore: 20,
    status: "Published",
    studentMarks: {
      s01: { score: 18, remarks: "Excellent performance!" },
      s02: { score: 12, remarks: "Need to focus on quadratic formulas." }
    }
  },
  {
    id: "t2",
    title: "Physics - Quantum Mechanics Test",
    subject: "Science",
    batchId: "b2",
    date: "2026-06-19",
    maxScore: 20,
    status: "Published",
    studentMarks: {
      s03: { score: 16, remarks: "Great conceptual understanding." },
      s04: { score: 13, remarks: "A bit slow in solving numericals." }
    }
  },
  {
    id: "t3",
    title: "Chemistry - Aldehydes Test",
    subject: "Science",
    batchId: "b2",
    date: "2026-06-26",
    maxScore: 20,
    status: "Result Pending",
    studentMarks: {
      s03: { score: "", remarks: "" },
      s04: { score: "", remarks: "" }
    }
  }
];

export const initialOnlineClasses = [
  {
    id: "c1",
    title: "Algebra Revision Session",
    subject: "Mathematics",
    batchId: "b1",
    date: "2026-07-30",
    time: "09:00 AM - 10:00 AM",
    status: "upcoming",
  },
  {
    id: "c2",
    title: "Introduction to Newton's Laws",
    subject: "Science",
    batchId: "b2",
    date: "2026-07-29",
    time: "11:00 AM - 12:00 PM",
    status: "live",
  },
  {
    id: "c3",
    title: "Organic Chemistry Basics",
    subject: "Science",
    batchId: "b2",
    date: "2026-07-28",
    time: "11:00 AM - 12:00 PM",
    status: "completed",
  },
  {
    id: "c4",
    title: "Trigonometry Quiz Discussion",
    subject: "Mathematics",
    batchId: "b1",
    date: "2026-07-25",
    time: "09:00 AM - 10:00 AM",
    status: "cancelled",
  },
];

export const initialAttendanceRecords = [
  {
    id: "a1",
    date: "2026-07-29",
    batchId: "b1",
    subject: "Mathematics",
    teacherStatus: "Submitted",
    onlineClass: false,
    records: {
      s01: "present",
      s02: "absent"
    },
    remarks: {
      s01: "Very active in discussions",
      s02: "Sick leave"
    }
  },
  {
    id: "a2",
    date: "2026-07-28",
    batchId: "b2",
    subject: "Science",
    teacherStatus: "Submitted",
    onlineClass: true,
    records: {
      s03: "present",
      s04: "present"
    },
    remarks: {
      s03: "Joined online class on time",
      s04: "Joined online class with a minor delay"
    }
  }
];

export const initialNotifications = [
  {
    id: "n1",
    type: "assignment",
    text: "Priya Sharma submitted 'Geometry Problems'",
    date: "2026-07-29T10:30:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "test",
    text: "Weekly Test 3 ('Chemistry - Aldehydes Test') marks are pending publication",
    date: "2026-07-28T16:00:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "class",
    text: "Online Class 'Introduction to Newton's Laws' is now Live",
    date: "2026-07-29T11:00:00Z",
    read: true,
  },
  {
    id: "n4",
    type: "announcement",
    text: "Admin: Tuition center will remain closed on August 15th for Independence Day",
    date: "2026-07-27T09:00:00Z",
    read: true,
  },
];

export const initialTeacherProfile = {
  name: "Mrs. Sarah",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4",
  id: "T1001",
  email: "sarah.maths@growise.com",
  phone: "+91 98765 43210",
  qualification: "M.Sc. in Mathematics, B.Ed.",
  experience: "8+ Years Teaching Experience",
  subjects: ["Mathematics", "Science"],
  batches: ["Batch A (Grade 10)", "Batch C (Grade 9)"],
  joiningDate: "June 12, 2024",
};
