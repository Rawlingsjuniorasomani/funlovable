import { QuizQuestion } from "@/components/quiz/QuizPlayer";
import { FillInBlankQuestionData } from "@/components/quiz/FillInBlankQuestion";
import { MatchingQuestionData } from "@/components/quiz/MatchingQuestion";

export type AnyQuestion = 
  | (QuizQuestion & { type?: "multiple-choice" })
  | FillInBlankQuestionData
  | MatchingQuestionData;

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in minutes
  questions: AnyQuestion[];
  xpReward: number;
}

export const quizzes: Quiz[] = [
  // Mathematics Quizzes
  {
    id: "fractions-basics",
    title: "Fractions & Decimals",
    subject: "Mathematics",
    description: "Test your knowledge of fractions and decimal conversions",
    difficulty: "easy",
    duration: 10,
    xpReward: 100,
    questions: [
      {
        id: "fb1",
        type: "multiple-choice",
        question: "What is 3/4 + 1/2?",
        options: ["1 1/4", "1 1/2", "1", "3/4"],
        correctAnswer: 0,
        explanation: "To add fractions, find a common denominator. 3/4 + 2/4 = 5/4 = 1 1/4",
      },
      {
        id: "fb2",
        type: "fill-blank",
        question: "The decimal form of 1/4 is ___",
        blanks: ["0.25"],
        explanation: "1 divided by 4 equals 0.25",
      },
      {
        id: "fb3",
        type: "matching",
        question: "Match each fraction with its decimal equivalent:",
        pairs: [
          { left: "1/2", right: "0.5" },
          { left: "3/4", right: "0.75" },
          { left: "1/5", right: "0.2" },
          { left: "2/5", right: "0.4" },
        ],
        explanation: "To convert a fraction to decimal, divide the numerator by the denominator.",
      },
      {
        id: "fb4",
        type: "multiple-choice",
        question: "Which fraction is equivalent to 0.6?",
        options: ["1/6", "3/5", "2/3", "6/10"],
        correctAnswer: 1,
        explanation: "0.6 = 6/10 = 3/5 when simplified",
      },
      {
        id: "fb5",
        type: "fill-blank",
        question: "3/4 × 2/3 = ___",
        blanks: ["1/2"],
        explanation: "Multiply numerators: 3×2=6, multiply denominators: 4×3=12. 6/12 = 1/2",
      },
    ],
  },
  {
    id: "algebra-intro",
    title: "Introduction to Algebra",
    subject: "Mathematics",
    description: "Basic algebraic expressions and equations",
    difficulty: "medium",
    duration: 15,
    xpReward: 150,
    questions: [
      {
        id: "alg1",
        type: "fill-blank",
        question: "If x + 5 = 12, then x = ___",
        blanks: ["7"],
        explanation: "Subtract 5 from both sides: x = 12 - 5 = 7",
      },
      {
        id: "alg2",
        type: "multiple-choice",
        question: "Simplify: 3x + 2x",
        options: ["5x", "6x", "5x²", "32x"],
        correctAnswer: 0,
        explanation: "Like terms can be combined: 3x + 2x = 5x",
      },
      {
        id: "alg3",
        type: "matching",
        question: "Match the expression with its simplified form:",
        pairs: [
          { left: "2(x + 3)", right: "2x + 6" },
          { left: "x² × x", right: "x³" },
          { left: "6x ÷ 2", right: "3x" },
          { left: "x + x + x", right: "3x" },
        ],
      },
      {
        id: "alg4",
        type: "fill-blank",
        question: "If 2y = 14, then y = ___",
        blanks: ["7"],
        explanation: "Divide both sides by 2: y = 14 ÷ 2 = 7",
      },
      {
        id: "alg5",
        type: "multiple-choice",
        question: "Which expression represents 'five more than twice a number n'?",
        options: ["5 + 2n", "5n + 2", "2(n + 5)", "5 × 2n"],
        correctAnswer: 0,
        explanation: "Twice a number is 2n, five more means adding 5: 2n + 5 or 5 + 2n",
      },
    ],
  },
  // Science Quizzes
  {
    id: "human-body",
    title: "Human Body Systems",
    subject: "Science",
    description: "Learn about the major systems in the human body",
    difficulty: "medium",
    duration: 12,
    xpReward: 120,
    questions: [
      {
        id: "hb1",
        type: "matching",
        question: "Match each organ with its body system:",
        pairs: [
          { left: "Heart", right: "Circulatory System" },
          { left: "Lungs", right: "Respiratory System" },
          { left: "Brain", right: "Nervous System" },
          { left: "Stomach", right: "Digestive System" },
        ],
      },
      {
        id: "hb2",
        type: "fill-blank",
        question: "The ___ pumps blood throughout the body.",
        blanks: ["heart"],
        explanation: "The heart is the muscular organ that pumps blood through the circulatory system.",
      },
      {
        id: "hb3",
        type: "multiple-choice",
        question: "Which system is responsible for breaking down food?",
        options: ["Nervous System", "Digestive System", "Skeletal System", "Muscular System"],
        correctAnswer: 1,
        explanation: "The digestive system breaks down food into nutrients the body can use.",
      },
      {
        id: "hb4",
        type: "fill-blank",
        question: "Red blood cells carry ___ to all parts of the body.",
        blanks: ["oxygen"],
        explanation: "Hemoglobin in red blood cells binds to oxygen and transports it throughout the body.",
      },
      {
        id: "hb5",
        type: "multiple-choice",
        question: "How many bones are in the adult human body?",
        options: ["106", "206", "306", "406"],
        correctAnswer: 1,
        explanation: "An adult human body has 206 bones.",
      },
    ],
  },
  // English Quizzes
  {
    id: "grammar-basics",
    title: "Grammar Fundamentals",
    subject: "English",
    description: "Parts of speech and basic sentence structure",
    difficulty: "easy",
    duration: 10,
    xpReward: 100,
    questions: [
      {
        id: "gr1",
        type: "matching",
        question: "Match each word with its part of speech:",
        pairs: [
          { left: "quickly", right: "Adverb" },
          { left: "beautiful", right: "Adjective" },
          { left: "happiness", right: "Noun" },
          { left: "run", right: "Verb" },
        ],
      },
      {
        id: "gr2",
        type: "fill-blank",
        question: "She ___ to school every day. (go - present tense)",
        blanks: ["goes"],
        explanation: "For third person singular (she/he/it) in present tense, we add 's' or 'es' to the verb.",
      },
      {
        id: "gr3",
        type: "multiple-choice",
        question: "Which sentence uses correct punctuation?",
        options: [
          "where are you going",
          "Where are you going?",
          "Where are you going.",
          "where are you going?",
        ],
        correctAnswer: 1,
        explanation: "Questions should start with a capital letter and end with a question mark.",
      },
      {
        id: "gr4",
        type: "fill-blank",
        question: "The plural of 'child' is ___",
        blanks: ["children"],
        explanation: "Child is an irregular noun - its plural form is children, not childs.",
      },
      {
        id: "gr5",
        type: "multiple-choice",
        question: "In the sentence 'The cat sat on the mat', what is the subject?",
        options: ["sat", "mat", "cat", "on"],
        correctAnswer: 2,
        explanation: "The subject is who or what performs the action. Here, 'The cat' is doing the sitting.",
      },
    ],
  },
  // Social Studies
  {
    id: "ghana-history",
    title: "History of Ghana",
    subject: "Social Studies",
    description: "Learn about Ghana's rich history and independence",
    difficulty: "medium",
    duration: 15,
    xpReward: 150,
    questions: [
      {
        id: "gh1",
        type: "fill-blank",
        question: "Ghana gained independence on March 6, ___",
        blanks: ["1957"],
        explanation: "Ghana became the first sub-Saharan African country to gain independence from colonial rule on March 6, 1957.",
      },
      {
        id: "gh2",
        type: "multiple-choice",
        question: "Who was Ghana's first president?",
        options: ["J.B. Danquah", "Kwame Nkrumah", "Jerry Rawlings", "John Kufuor"],
        correctAnswer: 1,
        explanation: "Dr. Kwame Nkrumah led Ghana to independence and became its first Prime Minister and later President.",
      },
      {
        id: "gh3",
        type: "matching",
        question: "Match the historical site with its location:",
        pairs: [
          { left: "Cape Coast Castle", right: "Central Region" },
          { left: "Manhyia Palace", right: "Ashanti Region" },
          { left: "Larabanga Mosque", right: "Northern Region" },
          { left: "Kwame Nkrumah Memorial", right: "Greater Accra" },
        ],
      },
      {
        id: "gh4",
        type: "fill-blank",
        question: "The capital city of Ghana is ___",
        blanks: ["Accra"],
        explanation: "Accra is the capital and largest city of Ghana.",
      },
      {
        id: "gh5",
        type: "multiple-choice",
        question: "What was Ghana called before independence?",
        options: ["Gold Coast", "Ivory Coast", "Silver Coast", "Upper Volta"],
        correctAnswer: 0,
        explanation: "Ghana was known as the Gold Coast under British colonial rule due to its rich gold resources.",
      },
    ],
  },
  // ICT Quizzes
  {
    id: "computer-basics",
    title: "Computer Basics",
    subject: "ICT",
    description: "Learn about computer hardware and software fundamentals",
    difficulty: "easy",
    duration: 10,
    xpReward: 100,
    questions: [
      {
        id: "ict1",
        type: "matching",
        question: "Match the hardware component with its function:",
        pairs: [
          { left: "CPU", right: "Processes data" },
          { left: "RAM", right: "Temporary storage" },
          { left: "Hard Drive", right: "Permanent storage" },
          { left: "Monitor", right: "Displays output" },
        ],
      },
      {
        id: "ict2",
        type: "fill-blank",
        question: "The brain of the computer is called the ___",
        blanks: ["CPU"],
        explanation: "CPU stands for Central Processing Unit - it processes all instructions.",
      },
      {
        id: "ict3",
        type: "multiple-choice",
        question: "Which of the following is an input device?",
        options: ["Monitor", "Printer", "Keyboard", "Speaker"],
        correctAnswer: 2,
        explanation: "A keyboard is used to input data into the computer.",
      },
      {
        id: "ict4",
        type: "multiple-choice",
        question: "What does RAM stand for?",
        options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Ready Access Memory"],
        correctAnswer: 1,
        explanation: "RAM stands for Random Access Memory - temporary memory that stores data while the computer is running.",
      },
      {
        id: "ict5",
        type: "fill-blank",
        question: "Microsoft Word is an example of ___ software.",
        blanks: ["application"],
        explanation: "Application software is designed to help users perform specific tasks like word processing.",
      },
    ],
  },
  {
    id: "internet-safety",
    title: "Internet Safety",
    subject: "ICT",
    description: "Learn how to stay safe online",
    difficulty: "medium",
    duration: 12,
    xpReward: 120,
    questions: [
      {
        id: "is1",
        type: "multiple-choice",
        question: "What should you do if a stranger asks for your personal information online?",
        options: ["Share it immediately", "Ignore and report", "Ask for their information first", "Share only your name"],
        correctAnswer: 1,
        explanation: "Never share personal information with strangers online. Always ignore and report suspicious requests.",
      },
      {
        id: "is2",
        type: "fill-blank",
        question: "A strong password should include letters, numbers, and ___",
        blanks: ["symbols"],
        explanation: "Strong passwords include a mix of uppercase, lowercase, numbers, and special symbols.",
      },
      {
        id: "is3",
        type: "matching",
        question: "Match the online threat with its description:",
        pairs: [
          { left: "Phishing", right: "Fake emails to steal data" },
          { left: "Malware", right: "Harmful software" },
          { left: "Cyberbullying", right: "Online harassment" },
          { left: "Identity theft", right: "Stealing personal info" },
        ],
      },
      {
        id: "is4",
        type: "multiple-choice",
        question: "Which website is likely safe to visit?",
        options: ["http://free-money.com", "https://www.schoolportal.edu.gh", "http://click-here-now.xyz", "http://winner-prize.net"],
        correctAnswer: 1,
        explanation: "Websites with 'https' and recognized domains (.edu, .gov) are generally safer.",
      },
      {
        id: "is5",
        type: "fill-blank",
        question: "The 's' in 'https' stands for ___",
        blanks: ["secure"],
        explanation: "HTTPS means Hypertext Transfer Protocol Secure - indicating encrypted connection.",
      },
    ],
  },
  // French Quizzes
  {
    id: "french-greetings",
    title: "French Greetings",
    subject: "French",
    description: "Learn basic French greetings and introductions",
    difficulty: "easy",
    duration: 10,
    xpReward: 100,
    questions: [
      {
        id: "fr1",
        type: "matching",
        question: "Match the French greeting with its English meaning:",
        pairs: [
          { left: "Bonjour", right: "Good morning/Hello" },
          { left: "Bonsoir", right: "Good evening" },
          { left: "Au revoir", right: "Goodbye" },
          { left: "Merci", right: "Thank you" },
        ],
      },
      {
        id: "fr2",
        type: "fill-blank",
        question: "Comment vous appelez-vous? means 'What is your ___?'",
        blanks: ["name"],
        explanation: "'Comment vous appelez-vous?' is the formal way to ask someone's name in French.",
      },
      {
        id: "fr3",
        type: "multiple-choice",
        question: "How do you say 'How are you?' in French?",
        options: ["Comment allez-vous?", "Je m'appelle", "S'il vous plaît", "Excusez-moi"],
        correctAnswer: 0,
        explanation: "'Comment allez-vous?' is the formal way to ask 'How are you?' in French.",
      },
      {
        id: "fr4",
        type: "fill-blank",
        question: "Je m'appelle Marie means 'My ___ is Marie'",
        blanks: ["name"],
        explanation: "'Je m'appelle' literally means 'I call myself' but translates to 'My name is'.",
      },
      {
        id: "fr5",
        type: "multiple-choice",
        question: "What is the French word for 'please'?",
        options: ["Merci", "Pardon", "S'il vous plaît", "De rien"],
        correctAnswer: 2,
        explanation: "'S'il vous plaît' means 'please' in French (formal form).",
      },
    ],
  },
  {
    id: "french-numbers",
    title: "French Numbers 1-20",
    subject: "French",
    description: "Learn to count in French",
    difficulty: "easy",
    duration: 8,
    xpReward: 80,
    questions: [
      {
        id: "fn1",
        type: "matching",
        question: "Match the French number with its value:",
        pairs: [
          { left: "un", right: "1" },
          { left: "cinq", right: "5" },
          { left: "dix", right: "10" },
          { left: "vingt", right: "20" },
        ],
      },
      {
        id: "fn2",
        type: "fill-blank",
        question: "The French word for 'seven' is ___",
        blanks: ["sept"],
        explanation: "Sept (pronounced 'set') means seven in French.",
      },
      {
        id: "fn3",
        type: "multiple-choice",
        question: "What is 'quinze' in English?",
        options: ["14", "15", "16", "17"],
        correctAnswer: 1,
        explanation: "Quinze means fifteen in French.",
      },
      {
        id: "fn4",
        type: "fill-blank",
        question: "Douze means ___ in English",
        blanks: ["twelve"],
        explanation: "Douze is the French word for twelve (12).",
      },
      {
        id: "fn5",
        type: "multiple-choice",
        question: "How do you say '18' in French?",
        options: ["seize", "dix-sept", "dix-huit", "dix-neuf"],
        correctAnswer: 2,
        explanation: "Dix-huit (literally 'ten-eight') means eighteen.",
      },
    ],
  },
  // Religious & Moral Education
  {
    id: "moral-values",
    title: "Moral Values",
    subject: "Religious & Moral Education",
    description: "Learn about important moral values and ethics",
    difficulty: "easy",
    duration: 10,
    xpReward: 100,
    questions: [
      {
        id: "rme1",
        type: "matching",
        question: "Match the moral value with its meaning:",
        pairs: [
          { left: "Honesty", right: "Telling the truth" },
          { left: "Respect", right: "Treating others well" },
          { left: "Responsibility", right: "Being accountable" },
          { left: "Kindness", right: "Being caring to others" },
        ],
      },
      {
        id: "rme2",
        type: "multiple-choice",
        question: "Which of these demonstrates honesty?",
        options: ["Copying a friend's homework", "Admitting when you make a mistake", "Blaming others for your actions", "Hiding the truth from parents"],
        correctAnswer: 1,
        explanation: "Admitting mistakes shows honesty - a key moral value.",
      },
      {
        id: "rme3",
        type: "fill-blank",
        question: "The Golden Rule says: Treat others as you want to be ___",
        blanks: ["treated"],
        explanation: "The Golden Rule is a universal moral principle found in many cultures and religions.",
      },
      {
        id: "rme4",
        type: "multiple-choice",
        question: "Why is it important to show respect to elders?",
        options: ["Because they are older", "To learn from their wisdom and experience", "Only when they give you things", "It's not important"],
        correctAnswer: 1,
        explanation: "Elders have valuable life experiences and wisdom to share with younger generations.",
      },
      {
        id: "rme5",
        type: "fill-blank",
        question: "Helping someone in need without expecting anything in return is called ___",
        blanks: ["kindness"],
        explanation: "Kindness involves helping others selflessly, without expecting rewards.",
      },
    ],
  },
  {
    id: "world-religions",
    title: "World Religions",
    subject: "Religious & Moral Education",
    description: "Learn about major world religions",
    difficulty: "medium",
    duration: 15,
    xpReward: 150,
    questions: [
      {
        id: "wr1",
        type: "matching",
        question: "Match the religion with its holy book:",
        pairs: [
          { left: "Christianity", right: "Bible" },
          { left: "Islam", right: "Quran" },
          { left: "Judaism", right: "Torah" },
          { left: "Hinduism", right: "Vedas" },
        ],
      },
      {
        id: "wr2",
        type: "fill-blank",
        question: "Muslims pray ___ times a day",
        blanks: ["five"],
        explanation: "The five daily prayers (Salah) are an important pillar of Islam.",
      },
      {
        id: "wr3",
        type: "multiple-choice",
        question: "What is the holy day of worship for Christians?",
        options: ["Friday", "Saturday", "Sunday", "Monday"],
        correctAnswer: 2,
        explanation: "Sunday is observed as the holy day of worship in most Christian traditions.",
      },
      {
        id: "wr4",
        type: "fill-blank",
        question: "The founder of Buddhism was Siddhartha ___",
        blanks: ["Gautama"],
        explanation: "Siddhartha Gautama, later known as Buddha, founded Buddhism in ancient India.",
      },
      {
        id: "wr5",
        type: "multiple-choice",
        question: "What do all major religions have in common?",
        options: ["Same god", "Same holy book", "Teaching of love and peace", "Same place of worship"],
        correctAnswer: 2,
        explanation: "Despite their differences, all major world religions teach values of love, peace, and compassion.",
      },
    ],
  },
];

export const getQuizzesBySubject = (subject: string) => 
  quizzes.filter((q) => q.subject === subject);

export const getQuizById = (id: string) => 
  quizzes.find((q) => q.id === id);

export const subjects = [...new Set(quizzes.map((q) => q.subject))];
