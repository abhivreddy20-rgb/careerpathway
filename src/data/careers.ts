export interface Career {
  id: string
  title: string
  category: string
  description: string
  avgSalary: string
  growth: string
  education: string
  skills: string[]
  icon: string
}

export const categories = [
  'All',
  'Technology',
  'Healthcare',
  'Business',
  'Creative',
  'Science',
  'Education',
] as const

export const careers: Career[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain software applications and systems. Work with teams to build products used by millions.',
    avgSalary: '$110,000 - $180,000',
    growth: '25%',
    education: "Bachelor's in Computer Science or related field",
    skills: ['Programming', 'Problem Solving', 'System Design', 'Collaboration'],
    icon: '💻',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Technology',
    description: 'Analyze complex data sets to identify trends, build predictive models, and help organizations make data-driven decisions.',
    avgSalary: '$100,000 - $160,000',
    growth: '35%',
    education: "Master's in Data Science, Statistics, or related field",
    skills: ['Statistics', 'Machine Learning', 'Python', 'Data Visualization'],
    icon: '📊',
  },
  {
    id: 'ux-designer',
    title: 'UX Designer',
    category: 'Creative',
    description: 'Research user needs and design intuitive, accessible digital experiences. Bridge the gap between users and technology.',
    avgSalary: '$85,000 - $140,000',
    growth: '16%',
    education: "Bachelor's in Design, HCI, or related field",
    skills: ['User Research', 'Prototyping', 'Visual Design', 'Empathy'],
    icon: '🎨',
  },
  {
    id: 'registered-nurse',
    title: 'Registered Nurse',
    category: 'Healthcare',
    description: 'Provide patient care, educate patients about health conditions, and offer emotional support to patients and their families.',
    avgSalary: '$60,000 - $120,000',
    growth: '6%',
    education: "Bachelor's of Science in Nursing (BSN)",
    skills: ['Patient Care', 'Critical Thinking', 'Communication', 'Stamina'],
    icon: '🏥',
  },
  {
    id: 'physician',
    title: 'Physician',
    category: 'Healthcare',
    description: 'Diagnose and treat injuries and illnesses. Examine patients, prescribe medications, and order diagnostic tests.',
    avgSalary: '$200,000 - $400,000',
    growth: '3%',
    education: 'Doctor of Medicine (MD) + Residency',
    skills: ['Diagnosis', 'Patient Care', 'Decision Making', 'Continuous Learning'],
    icon: '⚕️',
  },
  {
    id: 'financial-analyst',
    title: 'Financial Analyst',
    category: 'Business',
    description: 'Evaluate financial data, prepare reports, and recommend investment decisions to help businesses and individuals grow wealth.',
    avgSalary: '$65,000 - $120,000',
    growth: '9%',
    education: "Bachelor's in Finance, Economics, or Accounting",
    skills: ['Financial Modeling', 'Excel', 'Analysis', 'Communication'],
    icon: '📈',
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    category: 'Business',
    description: 'Plan and execute marketing campaigns, manage brand strategy, and drive customer acquisition and engagement.',
    avgSalary: '$75,000 - $140,000',
    growth: '10%',
    education: "Bachelor's in Marketing, Business, or Communications",
    skills: ['Strategy', 'Analytics', 'Creativity', 'Leadership'],
    icon: '📣',
  },
  {
    id: 'environmental-scientist',
    title: 'Environmental Scientist',
    category: 'Science',
    description: 'Study the environment and develop solutions to environmental problems like pollution, climate change, and conservation.',
    avgSalary: '$55,000 - $100,000',
    growth: '6%',
    education: "Bachelor's in Environmental Science or related field",
    skills: ['Research', 'Data Analysis', 'Field Work', 'Policy Knowledge'],
    icon: '🌍',
  },
  {
    id: 'biomedical-engineer',
    title: 'Biomedical Engineer',
    category: 'Science',
    description: 'Apply engineering principles to healthcare by designing medical devices, prosthetics, and diagnostic equipment.',
    avgSalary: '$70,000 - $130,000',
    growth: '5%',
    education: "Bachelor's in Biomedical Engineering",
    skills: ['Engineering', 'Biology', 'Problem Solving', 'Prototyping'],
    icon: '🔬',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    category: 'Education',
    description: 'Educate and inspire students by creating lesson plans, assessing progress, and fostering a positive learning environment.',
    avgSalary: '$45,000 - $80,000',
    growth: '4%',
    education: "Bachelor's in Education + Teaching License",
    skills: ['Communication', 'Patience', 'Creativity', 'Organization'],
    icon: '📚',
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Technology',
    description: 'Protect organizations from cyber threats by monitoring networks, investigating breaches, and implementing security measures.',
    avgSalary: '$90,000 - $150,000',
    growth: '33%',
    education: "Bachelor's in Cybersecurity, IT, or related field",
    skills: ['Network Security', 'Threat Analysis', 'Incident Response', 'Risk Assessment'],
    icon: '🛡️',
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    category: 'Creative',
    description: 'Create visual concepts using software or by hand to communicate ideas that inspire, inform, and captivate consumers.',
    avgSalary: '$50,000 - $90,000',
    growth: '3%',
    education: "Bachelor's in Graphic Design or Visual Arts",
    skills: ['Adobe Creative Suite', 'Typography', 'Color Theory', 'Creativity'],
    icon: '✏️',
  },
]

export const quizQuestions = [
  {
    id: 1,
    question: 'Which activity do you enjoy most?',
    options: [
      { text: 'Solving puzzles and coding', categories: ['Technology'] },
      { text: 'Helping people and caring for others', categories: ['Healthcare', 'Education'] },
      { text: 'Analyzing numbers and trends', categories: ['Business', 'Science'] },
      { text: 'Creating art and designing things', categories: ['Creative'] },
    ],
  },
  {
    id: 2,
    question: 'What kind of work environment do you prefer?',
    options: [
      { text: 'Office with a computer', categories: ['Technology', 'Business'] },
      { text: 'Hospitals or clinics', categories: ['Healthcare'] },
      { text: 'Studio or creative space', categories: ['Creative'] },
      { text: 'Laboratory or field work', categories: ['Science'] },
    ],
  },
  {
    id: 3,
    question: 'How do you prefer to solve problems?',
    options: [
      { text: 'With logic and data', categories: ['Technology', 'Science'] },
      { text: 'Through communication and empathy', categories: ['Healthcare', 'Education'] },
      { text: 'With strategy and planning', categories: ['Business'] },
      { text: 'Through visual thinking and design', categories: ['Creative'] },
    ],
  },
  {
    id: 4,
    question: 'What matters most to you in a career?',
    options: [
      { text: 'High salary and growth potential', categories: ['Technology', 'Business'] },
      { text: 'Making a difference in peoples lives', categories: ['Healthcare', 'Education'] },
      { text: 'Intellectual challenge and discovery', categories: ['Science', 'Technology'] },
      { text: 'Creative freedom and expression', categories: ['Creative'] },
    ],
  },
  {
    id: 5,
    question: 'Which school subject did you enjoy most?',
    options: [
      { text: 'Math and Computer Science', categories: ['Technology'] },
      { text: 'Biology and Chemistry', categories: ['Healthcare', 'Science'] },
      { text: 'Economics and Business Studies', categories: ['Business'] },
      { text: 'Art and Literature', categories: ['Creative', 'Education'] },
    ],
  },
]
