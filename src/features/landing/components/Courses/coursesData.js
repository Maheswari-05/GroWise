
import mathsImg  from "../../../../assets/courses/mathematics.jpg";
import englishImg from "../../../../assets/courses/english.jpg";
import biologyImg from "../../../../assets/courses/biology.jpg";
import aptitudeImg from "../../../../assets/courses/aptitude.jpg";
import aiImg      from "../../../../assets/courses/agentic-ai.jpg";
import javaImg    from "../../../../assets/courses/java.jpg";
import pythonImg  from "../../../../assets/courses/python.jpg";
import webImg     from "../../../../assets/courses/web-development.jpg";
import extraImg   from "../../../../assets/courses/124292.jpg";

import h1 from "../../../../assets/courses/human1.jpg";
import h2 from "../../../../assets/courses/human2.jpg";
import h3 from "../../../../assets/courses/human3.jpg";
import h4 from "../../../../assets/courses/human4.jpg";
import h5 from "../../../../assets/courses/human5.jpg";


const imgs    = [mathsImg, englishImg, biologyImg, aptitudeImg, aiImg, javaImg, pythonImg, webImg, extraImg];
const avatars = [h1, h2, h3, h4, h5];
const teachers = [
  "Mrs. Priya", "Ms. Ananya", "Mr. Arun", "Dr. Meenu",
  "Mr. Karthik", "Mr. Vishnu", "Dr. Divya", "Mr. Sanjay",
  "Mrs. Kavya",  "Mr. Rahul",
];
const colors = [
  "#4f46e5","#0ea5e9","#8b5cf6","#10b981",
  "#f59e0b","#ec4899","#06b6d4","#6366f1",
];
const badges = [
  "Bestseller","Popular","Top Rated","New","Hot","Trending",null,null,
];

const CATEGORIES = [
  { key: "All",              label: "All" },
  { key: "Class 1-5",       label: "Class 1–5" },
  { key: "Class 6-8",       label: "Class 6–8" },
  { key: "Class 9-10",      label: "Class 9–10" },
  { key: "Class 11-12",     label: "Class 11–12" },
  { key: "Programming",     label: "Programming" },
  { key: "AI & ML",         label: "AI & ML" },
  { key: "Web Development", label: "Web Development" },
  { key: "Languages",       label: "Languages" },
  { key: "Competitive Exams", label: "Competitive Exams" },
];

const COURSE_DEFS = {
  "All": [
    { title:"Mathematics",             grade:"Class 10",          lessons:120, rating:4.9, students:"1.8K" },
    { title:"Physics",                 grade:"Class 11 & 12",     lessons:95,  rating:4.9, students:"1.5K" },
    { title:"Python Programming",      grade:"Beginner",          lessons:110, rating:5.0, students:"2.2K" },
    { title:"Full Stack Web Dev",      grade:"React & Node.js",   lessons:145, rating:5.0, students:"2.4K" },
    { title:"Agentic AI",              grade:"Advanced",          lessons:135, rating:5.0, students:"1.1K" },
    { title:"English Communication",   grade:"Speaking & Grammar",lessons:80,  rating:4.8, students:"1.4K" },
    { title:"Biology",                 grade:"NEET Foundation",   lessons:105, rating:4.9, students:"1.7K" },
    { title:"Quantitative Aptitude",   grade:"Placement Prep",    lessons:85,  rating:4.8, students:"2.0K" },
  ],
  "Class 1-5": [
    { title:"Maths Basics",            grade:"Class 1",           lessons:60,  rating:4.9, students:"900"  },
    { title:"English Basics",          grade:"Class 3",           lessons:55,  rating:4.8, students:"780"  },
    { title:"Science Wonders",         grade:"Class 4",           lessons:50,  rating:4.7, students:"650"  },
    { title:"EVS Explorer",            grade:"Class 5",           lessons:48,  rating:4.9, students:"720"  },
    { title:"Hindi Foundation",        grade:"Class 2",           lessons:42,  rating:4.8, students:"560"  },
    { title:"Art & Creativity",        grade:"Class 1–5",         lessons:35,  rating:4.9, students:"410"  },
    { title:"Mental Maths",            grade:"Class 3–5",         lessons:40,  rating:5.0, students:"830"  },
    { title:"Phonics & Reading",       grade:"Class 1–2",         lessons:38,  rating:4.7, students:"490"  },
  ],
  "Class 6-8": [
    { title:"Mathematics",             grade:"Class 8",           lessons:90,  rating:4.8, students:"1.1K" },
    { title:"Science",                 grade:"Class 7",           lessons:85,  rating:4.9, students:"980"  },
    { title:"Geography",               grade:"Class 6",           lessons:65,  rating:4.7, students:"760"  },
    { title:"History",                 grade:"Class 8",           lessons:70,  rating:4.8, students:"840"  },
    { title:"English Grammar",         grade:"Class 6–8",         lessons:72,  rating:4.9, students:"920"  },
    { title:"Hindi Literature",        grade:"Class 7–8",         lessons:68,  rating:4.7, students:"680"  },
    { title:"Computer Basics",         grade:"Class 6–8",         lessons:55,  rating:4.9, students:"1.0K" },
    { title:"Coding Fundamentals",     grade:"Class 7–8",         lessons:60,  rating:5.0, students:"1.3K" },
  ],
  "Class 9-10": [
    { title:"Mathematics",             grade:"Class 10",          lessons:120, rating:4.9, students:"1.8K" },
    { title:"Physics",                 grade:"Class 10",          lessons:100, rating:4.9, students:"1.6K" },
    { title:"Chemistry",               grade:"Class 10",          lessons:95,  rating:4.8, students:"1.4K" },
    { title:"Biology",                 grade:"Class 10",          lessons:90,  rating:4.9, students:"1.3K" },
    { title:"English Literature",      grade:"Class 9 & 10",      lessons:80,  rating:4.8, students:"1.2K" },
    { title:"Social Science",          grade:"Class 9 & 10",      lessons:85,  rating:4.7, students:"1.1K" },
    { title:"Hindi",                   grade:"Class 9 & 10",      lessons:75,  rating:4.8, students:"980"  },
    { title:"IT Fundamentals",         grade:"Class 9–10",        lessons:60,  rating:4.9, students:"1.0K" },
  ],
  "Class 11-12": [
    { title:"Mathematics",             grade:"Class 12",          lessons:140, rating:4.9, students:"2.0K" },
    { title:"Physics",                 grade:"Class 11 & 12",     lessons:130, rating:4.9, students:"1.8K" },
    { title:"Chemistry",               grade:"Class 11 & 12",     lessons:125, rating:4.8, students:"1.6K" },
    { title:"Biology / NEET",          grade:"NEET Prep",         lessons:140, rating:5.0, students:"1.9K" },
    { title:"Accountancy",             grade:"Commerce",          lessons:95,  rating:4.8, students:"1.3K" },
    { title:"Business Studies",        grade:"Commerce",          lessons:85,  rating:4.7, students:"1.1K" },
    { title:"Economics",               grade:"Class 11 & 12",     lessons:90,  rating:4.9, students:"1.4K" },
    { title:"Computer Science",        grade:"Class 11 & 12",     lessons:100, rating:5.0, students:"1.7K" },
  ],
  "Programming": [
    { title:"Python Programming",      grade:"Beginner",          lessons:110, rating:5.0, students:"2.2K" },
    { title:"Java Programming",        grade:"Intermediate",      lessons:125, rating:4.9, students:"1.6K" },
    { title:"Full Stack Web Dev",      grade:"React & Node.js",   lessons:145, rating:5.0, students:"2.4K" },
    { title:"C++ Fundamentals",        grade:"Beginner",          lessons:95,  rating:4.8, students:"1.3K" },
    { title:"Data Structures",         grade:"Intermediate",      lessons:115, rating:4.9, students:"1.5K" },
    { title:"React.js Mastery",        grade:"Advanced",          lessons:100, rating:5.0, students:"2.0K" },
    { title:"Flutter & Dart",          grade:"Mobile Dev",        lessons:90,  rating:4.8, students:"1.1K" },
    { title:"TypeScript Essentials",   grade:"Intermediate",      lessons:75,  rating:4.7, students:"950"  },
  ],
  "AI & ML": [
    { title:"Agentic AI",              grade:"Advanced",          lessons:135, rating:5.0, students:"1.1K" },
    { title:"Machine Learning",        grade:"Intermediate",      lessons:120, rating:4.9, students:"1.5K" },
    { title:"Deep Learning",           grade:"Advanced",          lessons:130, rating:4.9, students:"980"  },
    { title:"NLP Fundamentals",        grade:"Advanced",          lessons:95,  rating:4.8, students:"820"  },
    { title:"Computer Vision",         grade:"Advanced",          lessons:100, rating:4.9, students:"760"  },
    { title:"Data Science",            grade:"Intermediate",      lessons:115, rating:5.0, students:"1.8K" },
    { title:"AI Ethics",               grade:"All Levels",        lessons:50,  rating:4.7, students:"540"  },
    { title:"Prompt Engineering",      grade:"Beginner",          lessons:45,  rating:5.0, students:"2.1K" },
  ],
  "Web Development": [
    { title:"HTML & CSS Mastery",      grade:"Beginner",          lessons:80,  rating:4.9, students:"2.3K" },
    { title:"JavaScript Essentials",   grade:"Beginner",          lessons:100, rating:5.0, students:"2.5K" },
    { title:"React.js",                grade:"Intermediate",      lessons:110, rating:5.0, students:"2.1K" },
    { title:"Node.js & Express",       grade:"Backend",           lessons:90,  rating:4.9, students:"1.6K" },
    { title:"MongoDB & SQL",           grade:"Database",          lessons:75,  rating:4.8, students:"1.3K" },
    { title:"UI/UX Design",            grade:"Beginner",          lessons:65,  rating:4.8, students:"1.5K" },
    { title:"Next.js",                 grade:"Advanced",          lessons:95,  rating:4.9, students:"1.7K" },
    { title:"DevOps & CI/CD",          grade:"Advanced",          lessons:85,  rating:4.7, students:"900"  },
  ],
  "Languages": [
    { title:"English Communication",   grade:"Speaking & Grammar",lessons:80,  rating:4.8, students:"1.4K" },
    { title:"Hindi Literature",        grade:"Class 10–12",       lessons:70,  rating:4.7, students:"980"  },
    { title:"French Beginner",         grade:"A1 Level",          lessons:60,  rating:4.8, students:"720"  },
    { title:"German Foundation",       grade:"A1 Level",          lessons:65,  rating:4.7, students:"650"  },
    { title:"Japanese Basics",         grade:"Beginner",          lessons:55,  rating:4.9, students:"590"  },
    { title:"Sanskrit",                grade:"Class 6–12",        lessons:72,  rating:4.8, students:"810"  },
    { title:"IELTS Preparation",       grade:"All Levels",        lessons:85,  rating:5.0, students:"1.6K" },
    { title:"Spoken English",          grade:"Beginner",          lessons:50,  rating:4.9, students:"2.0K" },
  ],
  "Competitive Exams": [
    { title:"Quantitative Aptitude",   grade:"Placement Prep",    lessons:85,  rating:4.8, students:"2.0K" },
    { title:"JEE Mathematics",         grade:"Class 11 & 12",     lessons:150, rating:5.0, students:"2.5K" },
    { title:"NEET Biology",            grade:"NEET Prep",         lessons:140, rating:5.0, students:"2.2K" },
    { title:"UPSC Preparation",        grade:"All Levels",        lessons:130, rating:4.9, students:"1.8K" },
    { title:"Verbal Reasoning",        grade:"All Exams",         lessons:70,  rating:4.8, students:"1.4K" },
    { title:"Logical Reasoning",       grade:"All Exams",         lessons:75,  rating:4.9, students:"1.6K" },
    { title:"GK & Current Affairs",    grade:"All Exams",         lessons:55,  rating:4.7, students:"1.1K" },
    { title:"CAT Preparation",         grade:"MBA Aspirants",     lessons:120, rating:4.9, students:"1.3K" },
  ],
};


let idCounter = 1;
const courses = [];

for (const { key } of CATEGORIES) {
  const defs = COURSE_DEFS[key] || [];
  defs.forEach((def, i) => {
    courses.push({
      id:       idCounter++,
      category: key,
      title:    def.title,
      grade:    def.grade,
      lessons:  def.lessons,
      rating:   def.rating,
      students: def.students,
      image:    imgs[i % imgs.length],
      avatar:   avatars[i % avatars.length],
      teacher:  teachers[i % teachers.length],
      badge:    badges[i % badges.length],
      color:    colors[i % colors.length],
    });
  });
}

export default courses;