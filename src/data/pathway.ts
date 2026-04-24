export type PathwayCategory = "courses" | "activities" | "volunteer" | "skills";

export type GradePlan = {
  gradeValue: string;
  label: string;
  courses: string[];
  activities: string[];
  volunteer: string[];
  skills: string[];
};

export type PathwayTrack =
  | "Technology"
  | "Healthcare"
  | "Business"
  | "Creative"
  | "Science"
  | "Education"
  | "General";

const TECH_KEYWORDS =
  /(software|engineer|developer|programmer|coder|data|machine learning|\bai\b|computer|cyber|\bit\b|devops|robotics)/;
const HEALTH_KEYWORDS =
  /(doctor|physician|nurse|medic|surgeon|dent|pharmac|therap|health|psych|vet|paramedic)/;
const BUSINESS_KEYWORDS =
  /(business|entrepreneur|finance|accountant|consult|market|manager|\bmba\b|sales|analyst|economist|banker)/;
const CREATIVE_KEYWORDS =
  /(design|artist|creative|\bux\b|\bui\b|illustrat|graphic|writer|musician|filmmaker|architect|photograph)/;
const SCIENCE_KEYWORDS =
  /(scientist|biolog|chem|physic|research|environment|astron|geolog|mathemat|biomedical)/;
const EDUCATION_KEYWORDS = /(teach|educ|professor|tutor|counselor)/;

export function detectTrack(profession: string): PathwayTrack {
  const p = profession.toLowerCase();
  if (TECH_KEYWORDS.test(p)) return "Technology";
  if (HEALTH_KEYWORDS.test(p)) return "Healthcare";
  if (CREATIVE_KEYWORDS.test(p)) return "Creative";
  if (SCIENCE_KEYWORDS.test(p)) return "Science";
  if (EDUCATION_KEYWORDS.test(p)) return "Education";
  if (BUSINESS_KEYWORDS.test(p)) return "Business";
  return "General";
}

const GRADE_LABELS: Record<string, string> = {
  "9": "9th Grade",
  "10": "10th Grade",
  "11": "11th Grade",
  "12": "12th Grade",
  college: "College / University",
  other: "Your Path",
};

export function gradeSequence(currentGrade: string): string[] {
  if (currentGrade === "college") return ["college"];
  const n = parseInt(currentGrade, 10);
  if (!isNaN(n) && n >= 9 && n <= 12) {
    const seq: string[] = [];
    for (let g = n; g <= 12; g++) seq.push(String(g));
    return seq;
  }
  return ["9", "10", "11", "12"];
}

type PlanData = Omit<GradePlan, "gradeValue" | "label">;
type PlansByGrade = Record<string, PlanData>;

const general: PlansByGrade = {
  "9": {
    courses: ["Algebra I", "Biology", "English I", "World History"],
    activities: [
      "Join 2 clubs you're curious about",
      "Try out for a sport or performing art",
      "Attend a career-day event",
    ],
    volunteer: [
      "Local community center (5+ hrs/month)",
      "School cleanup or mentoring day",
    ],
    skills: [
      "Time management basics",
      "Note-taking systems",
      "Introduction to research",
    ],
  },
  "10": {
    courses: ["Geometry / Algebra II", "Chemistry", "English II", "US History"],
    activities: [
      "Take a leadership role in one club",
      "Job shadow a professional",
      "Start a long-term project you own",
    ],
    volunteer: [
      "Consistent monthly volunteering at one org",
      "Tutor younger students",
    ],
    skills: [
      "Public speaking fundamentals",
      "Basic financial literacy",
      "Collaboration tools (Docs, Sheets)",
    ],
  },
  "11": {
    courses: [
      "Pre-Calculus / Algebra II",
      "Physics",
      "English III / AP Lang",
      "US or World History",
    ],
    activities: [
      "Apply for a summer program or internship",
      "Lead a team or event",
      "Prep for SAT/ACT",
    ],
    volunteer: [
      "Sustained volunteering with measurable impact",
      "Organize a drive or fundraiser",
    ],
    skills: [
      "Essay writing and revision",
      "Project planning and deadlines",
      "Interviewing skills",
    ],
  },
  "12": {
    courses: ["Calculus or Statistics", "AP English / Lit", "Elective aligned to your path", "Government / Econ"],
    activities: [
      "Submit college or trade-program applications",
      "Capstone project in your focus area",
      "Apply for scholarships",
    ],
    volunteer: [
      "Mentor a younger student long-term",
      "Document your service impact for applications",
    ],
    skills: [
      "Resume and portfolio polish",
      "Budgeting for post-secondary life",
      "Networking and professional email",
    ],
  },
  college: {
    courses: [
      "Core courses in your major",
      "A quantitative or analytical course",
      "A writing-intensive course",
      "One elective outside your major",
    ],
    activities: [
      "Join a pre-professional or affinity club",
      "Attend career fairs each semester",
      "Apply for a summer internship",
    ],
    volunteer: [
      "Serve with a student-led service org",
      "Alternative break or service trip",
    ],
    skills: [
      "Industry-standard tools for your field",
      "LinkedIn and portfolio presence",
      "Independent research skills",
    ],
  },
};

const overlays: Record<Exclude<PathwayTrack, "General">, PlansByGrade> = {
  Technology: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "Intro to Computer Science"],
      activities: [
        "Build a personal site or small app",
        "Join a coding or robotics club",
        "Try a beginner hackathon",
      ],
      volunteer: [
        "Teach basic computer skills at a library",
        "Help set up tech for community events",
      ],
      skills: [
        "HTML/CSS basics",
        "Python fundamentals",
        "Git and version control",
      ],
    },
    "10": {
      courses: [
        "Geometry / Algebra II",
        "AP Computer Science Principles",
        "Chemistry",
        "English II",
      ],
      activities: [
        "Ship a project to GitHub with a README",
        "Competitive programming or CTF events",
        "Shadow a software engineer",
      ],
      volunteer: [
        "Run a coding club for middle schoolers",
        "Build a website for a local nonprofit",
      ],
      skills: [
        "Data structures (arrays, maps, lists)",
        "Debugging and reading tracebacks",
        "Command line basics",
      ],
    },
    "11": {
      courses: [
        "Pre-Calculus",
        "AP Computer Science A",
        "Physics",
        "AP English Lang",
      ],
      activities: [
        "Apply to a summer coding program or internship",
        "Release a project others actually use",
        "Study for SAT/ACT",
      ],
      volunteer: [
        "Lead a tech workshop at your school",
        "Open-source contribution to a small project",
      ],
      skills: [
        "One framework end-to-end (React, Flask, etc.)",
        "Writing technical READMEs",
        "Basic SQL",
      ],
    },
    "12": {
      courses: [
        "Calculus AB/BC",
        "AP Statistics",
        "Data Structures or Advanced CS",
        "AP English Lit",
      ],
      activities: [
        "Capstone: a polished portfolio project",
        "Apply to CS programs with a strong portfolio",
        "Attend a local tech meetup",
      ],
      volunteer: [
        "Mentor younger coding-club members",
        "Continue open-source or nonprofit site work",
      ],
      skills: [
        "System-design basics",
        "Technical interview prep (arrays, recursion)",
        "Professional LinkedIn and GitHub profile",
      ],
    },
    college: {
      courses: [
        "Data Structures & Algorithms",
        "Discrete Math",
        "Computer Systems / OS",
        "A web or ML elective",
      ],
      activities: [
        "Hackathons each year",
        "Internship every summer",
        "Ship one ambitious side project",
      ],
      volunteer: [
        "Teach intro CS to first-years",
        "Build tools for a campus org",
      ],
      skills: [
        "Proficiency in one systems language (C/C++/Rust/Go)",
        "Cloud basics (AWS/GCP free tier)",
        "Behavioral + technical interview prep",
      ],
    },
  },
  Healthcare: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "Health / PE"],
      activities: [
        "Join HOSA or a health-careers club",
        "Attend hospital-shadow info sessions",
        "Start a fitness habit",
      ],
      volunteer: [
        "Local hospital or nursing home (with permission)",
        "Red Cross blood-drive support",
      ],
      skills: [
        "Basic anatomy vocabulary",
        "Note-taking for dense material",
        "CPR / First Aid intro",
      ],
    },
    "10": {
      courses: [
        "Geometry / Algebra II",
        "Chemistry",
        "Anatomy (if offered)",
        "English II",
      ],
      activities: [
        "Shadow a physician or nurse",
        "Join HOSA leadership",
        "Attend a medical-ethics talk",
      ],
      volunteer: [
        "Regular hospital volunteer shifts",
        "Health-fair or clinic support",
      ],
      skills: [
        "CPR and First Aid certification",
        "Medical terminology basics",
        "Empathetic communication",
      ],
    },
    "11": {
      courses: [
        "Pre-Calculus",
        "AP Biology",
        "Physics or Chemistry II",
        "AP English Lang",
      ],
      activities: [
        "Apply to a pre-med / pre-health summer program",
        "Research project with a mentor",
        "SAT/ACT prep",
      ],
      volunteer: [
        "Sustained role at a clinic or hospital",
        "Organize a wellness drive",
      ],
      skills: [
        "Scientific writing basics",
        "Lab safety and technique",
        "Patient-facing communication",
      ],
    },
    "12": {
      courses: [
        "AP Chemistry",
        "Statistics",
        "Anatomy & Physiology",
        "AP English Lit",
      ],
      activities: [
        "Apply to pre-health undergrad programs",
        "Capstone: original health-related project",
        "Interview prep for health programs",
      ],
      volunteer: [
        "Log 100+ documented clinical hours",
        "Mentor younger HOSA members",
      ],
      skills: [
        "Résumé that highlights clinical hours",
        "Interviewing for health programs",
        "Stress management basics",
      ],
    },
    college: {
      courses: [
        "General Chemistry + Lab",
        "Organic Chemistry",
        "Biology + Lab",
        "Biostatistics or Psychology",
      ],
      activities: [
        "Pre-med / pre-health club leadership",
        "Clinical shadowing every semester",
        "Undergraduate research",
      ],
      volunteer: [
        "Free-clinic volunteer long-term",
        "Public-health outreach programs",
      ],
      skills: [
        "MCAT or program-specific entrance prep",
        "Scientific literature review",
        "Professional bedside manner",
      ],
    },
  },
  Creative: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "Intro Art or Design"],
      activities: [
        "Start a sketchbook or design journal",
        "Join art / theater / film club",
        "Enter one student showcase",
      ],
      volunteer: [
        "Design flyers for a local nonprofit",
        "Help set up a community arts event",
      ],
      skills: [
        "Fundamentals of drawing or composition",
        "Intro to a design tool (Figma / Canva)",
        "Giving and taking feedback",
      ],
    },
    "10": {
      courses: [
        "Geometry / Algebra II",
        "Intermediate Art / Graphic Design",
        "Chemistry",
        "English II",
      ],
      activities: [
        "Build a starter portfolio (5+ pieces)",
        "Enter a regional art or design contest",
        "Shadow a working designer or artist",
      ],
      volunteer: [
        "Rebrand a student org",
        "Volunteer at a museum or gallery",
      ],
      skills: [
        "Typography basics",
        "Color theory",
        "File organization for projects",
      ],
    },
    "11": {
      courses: [
        "Pre-Calculus",
        "AP Art & Design or Digital Media",
        "Physics or Film Studies",
        "AP English Lang",
      ],
      activities: [
        "Apply to a summer arts intensive",
        "Complete a self-directed long project",
        "Prep for SAT/ACT",
      ],
      volunteer: [
        "Design work for a community org",
        "Lead a creative workshop for kids",
      ],
      skills: [
        "Portfolio curation",
        "Critique vocabulary",
        "One advanced tool (Illustrator / Blender / Premiere)",
      ],
    },
    "12": {
      courses: [
        "Calculus or Statistics",
        "Advanced Art / Portfolio Course",
        "AP English Lit",
        "Elective in your medium",
      ],
      activities: [
        "Submit portfolio to art / design schools",
        "Host a personal showcase",
        "Interview prep for portfolio reviews",
      ],
      volunteer: [
        "Mentor younger art-club members",
        "Ongoing design work for nonprofit",
      ],
      skills: [
        "Portfolio site and case studies",
        "Artist or designer statement",
        "Presenting work out loud",
      ],
    },
    college: {
      courses: [
        "Foundations of Design",
        "Art History",
        "Studio course in your medium",
        "A writing-intensive course",
      ],
      activities: [
        "Freelance gigs or design for student orgs",
        "Internship at a studio or agency",
        "Annual portfolio refresh",
      ],
      volunteer: [
        "Design-for-good project with a nonprofit",
        "Teach a creative workshop",
      ],
      skills: [
        "Advanced Adobe / Figma / motion tools",
        "Client communication",
        "Case-study storytelling",
      ],
    },
  },
  Science: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "Earth Science"],
      activities: [
        "Join science olympiad or a research club",
        "Attend a university lab open-house",
        "Start a science-journal habit",
      ],
      volunteer: [
        "Help at a nature preserve or museum",
        "Citizen-science projects (iNaturalist, etc.)",
      ],
      skills: [
        "Lab notebook basics",
        "Reading a science paper",
        "Measurement and units",
      ],
    },
    "10": {
      courses: ["Geometry / Algebra II", "Chemistry", "English II", "Biology II"],
      activities: [
        "Compete in Science Olympiad or fairs",
        "Shadow a researcher",
        "Start a guided research project",
      ],
      volunteer: [
        "Assist a community-science program",
        "Environmental cleanup work",
      ],
      skills: [
        "Spreadsheet data work",
        "Scientific method fluency",
        "Graphing and visualization",
      ],
    },
    "11": {
      courses: ["Pre-Calculus", "AP Biology or AP Chemistry", "Physics", "AP English Lang"],
      activities: [
        "Apply to a summer research program",
        "Enter a regional science fair",
        "SAT/ACT prep",
      ],
      volunteer: [
        "Tutor middle schoolers in science",
        "Volunteer with a local lab or museum",
      ],
      skills: [
        "Statistical basics (mean, variance, p-value intuition)",
        "Scientific writing",
        "One analysis tool (Excel, R, or Python)",
      ],
    },
    "12": {
      courses: [
        "Calculus AB/BC",
        "AP Physics or AP Chemistry",
        "AP Statistics",
        "AP English Lit",
      ],
      activities: [
        "Submit a research poster or paper",
        "Apply to science undergrad programs",
        "Capstone research project",
      ],
      volunteer: [
        "Mentor younger science-club members",
        "Science outreach in schools",
      ],
      skills: [
        "Literature review",
        "Presenting research clearly",
        "Research résumé",
      ],
    },
    college: {
      courses: [
        "General Chemistry",
        "Calculus-based Physics",
        "Biology core",
        "Statistics / Data Analysis",
      ],
      activities: [
        "Join a research lab by sophomore year",
        "Present at a student research symposium",
        "REU or equivalent summer research",
      ],
      volunteer: [
        "Tutor intro-science courses",
        "Outreach to local schools",
      ],
      skills: [
        "Programming for science (Python / R / MATLAB)",
        "Grant- or abstract-writing",
        "Critiquing methodology",
      ],
    },
  },
  Business: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "Intro to Business (if offered)"],
      activities: [
        "Join DECA / FBLA / Future Business Leaders",
        "Track a small budget or side hustle",
        "Attend an entrepreneurship talk",
      ],
      volunteer: [
        "Help run a school fundraiser",
        "Community event logistics",
      ],
      skills: [
        "Email and meeting etiquette",
        "Intro to spreadsheets",
        "Reading a simple budget",
      ],
    },
    "10": {
      courses: ["Geometry / Algebra II", "Chemistry", "English II", "Economics or Business"],
      activities: [
        "Lead a DECA / FBLA project",
        "Run a real small business or Etsy shop",
        "Shadow someone in finance or marketing",
      ],
      volunteer: [
        "Treasurer role for a student org",
        "Organize a community drive",
      ],
      skills: [
        "Spreadsheet formulas",
        "Written pitching",
        "Basic P&L understanding",
      ],
    },
    "11": {
      courses: ["Pre-Calculus", "AP Economics", "Physics", "AP English Lang"],
      activities: [
        "Apply to a summer business program",
        "Compete in business/pitch competitions",
        "SAT/ACT prep",
      ],
      volunteer: [
        "Pro bono marketing for a nonprofit",
        "Event coordination leadership",
      ],
      skills: [
        "Financial modeling basics",
        "Slide design fundamentals",
        "Market research basics",
      ],
    },
    "12": {
      courses: [
        "AP Statistics or Calculus",
        "AP Economics II",
        "AP English Lit",
        "Elective in finance / marketing",
      ],
      activities: [
        "Apply to business undergrad programs",
        "Capstone: business plan or real venture",
        "Mock interviews",
      ],
      volunteer: [
        "Mentor younger DECA / FBLA members",
        "Ongoing pro bono work for a nonprofit",
      ],
      skills: [
        "Résumé for business internships",
        "LinkedIn and professional networking",
        "Case-study / interview prep",
      ],
    },
    college: {
      courses: [
        "Financial Accounting",
        "Microeconomics",
        "Statistics",
        "Marketing or Strategy intro",
      ],
      activities: [
        "Case competitions each year",
        "Internship every summer",
        "Join a pre-professional club",
      ],
      volunteer: [
        "Consulting club pro bono project",
        "Financial literacy workshops",
      ],
      skills: [
        "Excel / financial modeling",
        "SQL for analytics",
        "Behavioral + case interview prep",
      ],
    },
  },
  Education: {
    "9": {
      courses: ["Algebra I", "Biology", "English I", "World History"],
      activities: [
        "Tutor peers or younger students",
        "Join debate or speech club",
        "Observe a favorite teacher's class",
      ],
      volunteer: [
        "Elementary-school reading buddy",
        "Summer camp counselor in training",
      ],
      skills: [
        "Explaining an idea simply",
        "Active listening",
        "Note structuring",
      ],
    },
    "10": {
      courses: ["Geometry / Algebra II", "Chemistry", "English II", "Psychology"],
      activities: [
        "Lead a tutoring program",
        "Shadow a teacher for a week",
        "Join a teens-teach-tech club",
      ],
      volunteer: [
        "Weekly tutoring at a local school",
        "Help run a youth program",
      ],
      skills: [
        "Lesson-plan basics",
        "Giving feedback kindly and clearly",
        "Classroom tech tools",
      ],
    },
    "11": {
      courses: [
        "Pre-Calculus",
        "Physics or Environmental Science",
        "AP Psychology",
        "AP English Lang",
      ],
      activities: [
        "Apply to a summer teaching or counselor program",
        "Design and teach a short workshop",
        "SAT/ACT prep",
      ],
      volunteer: [
        "Lead a summer learning program",
        "Mentor middle-school students",
      ],
      skills: [
        "Classroom management basics",
        "Adapting material for different levels",
        "Educational writing",
      ],
    },
    "12": {
      courses: [
        "Calculus or Statistics",
        "AP English Lit",
        "Elective in your future subject",
        "Government / Econ",
      ],
      activities: [
        "Apply to education / subject-specific programs",
        "Capstone: design a full mini-curriculum",
        "Interview prep",
      ],
      volunteer: [
        "Mentor long-term at a school",
        "Organize a literacy or STEM drive",
      ],
      skills: [
        "Teaching résumé and philosophy statement",
        "Planning assessments",
        "Confident public speaking",
      ],
    },
    college: {
      courses: [
        "Foundations of Education",
        "Child / Adolescent Development",
        "A subject-area specialization",
        "Statistics or Research Methods",
      ],
      activities: [
        "Early classroom observations",
        "Tutoring or teaching-assistant roles",
        "Apply for student teaching placements",
      ],
      volunteer: [
        "After-school program regular",
        "Summer literacy or STEM camps",
      ],
      skills: [
        "Lesson planning at scale",
        "Classroom management frameworks",
        "Reflective teaching journals",
      ],
    },
  },
};

export function buildPathway(
  currentGrade: string,
  profession: string,
): { track: PathwayTrack; plans: GradePlan[] } {
  const track = detectTrack(profession);
  const sequence = gradeSequence(currentGrade);
  const source = track === "General" ? general : { ...general, ...overlays[track] };

  const plans = sequence.map<GradePlan>((g) => {
    const data = source[g] ?? general[g];
    return {
      gradeValue: g,
      label: GRADE_LABELS[g] ?? g,
      courses: data.courses,
      activities: data.activities,
      volunteer: data.volunteer,
      skills: data.skills,
    };
  });

  return { track, plans };
}

export function itemId(gradeValue: string, category: PathwayCategory, title: string): string {
  return `${gradeValue}:${category}:${title}`;
}
