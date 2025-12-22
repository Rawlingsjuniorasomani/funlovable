import { useNavigate } from "react-router-dom";
import { LessonViewer, LessonData } from "@/components/lesson/LessonViewer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";


const sampleLesson: LessonData = {
  id: "algebra-intro",
  title: "Introduction to Algebra",
  subject: "Mathematics",
  description: "Learn the fundamentals of algebra including variables, constants, and simple equations.",
  objectives: [
    "Understand what algebra is and its applications",
    "Identify variables and constants in expressions",
    "Write simple algebraic expressions",
    "Solve basic equations",
  ],
  sections: [
    {
      id: "section-1",
      title: "What is Algebra?",
      type: "video",
      content: "Algebra is a branch of mathematics that uses letters (called variables) to represent numbers. It allows us to solve problems where we don't know all the values. For example, if you have some apples and someone gives you 3 more, and now you have 7 apples total, algebra helps us figure out how many apples you started with! We write this as: x + 3 = 7, where x is the unknown number of apples.",
      duration: 45,
    },
    {
      id: "section-2",
      title: "Variables and Constants",
      type: "text",
      content: "A variable is a letter (like x, y, or n) that represents an unknown value that can change. A constant is a fixed number that doesn't change. In the expression 2x + 5, '2x' contains the variable 'x' which is multiplied by 2, and '5' is a constant. Variables are like empty boxes waiting to be filled with numbers, while constants are already known values.",
      duration: 60,
    },
    {
      id: "section-3",
      title: "Writing Expressions",
      type: "interactive",
      content: "Let's practice writing algebraic expressions! When we say 'a number plus 5', we write: n + 5. When we say 'twice a number', we write: 2n. When we say '3 less than a number', we write: n - 3. Key words to remember: 'sum' means add (+), 'difference' means subtract (-), 'product' means multiply (×), 'quotient' means divide (÷).",
      duration: 90,
    },
    {
      id: "section-4",
      title: "Solving Simple Equations",
      type: "video",
      content: "An equation is a mathematical statement showing two things are equal, like a balanced scale. To solve x + 3 = 7, we need to find what number x represents. We do this by 'undoing' what's been done to x. Since 3 was added to x, we subtract 3 from both sides: x + 3 - 3 = 7 - 3, which gives us x = 4. Let's verify: 4 + 3 = 7 ✓",
      duration: 75,
    },
  ],
};

export default function LessonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <LessonViewer
            lesson={sampleLesson}
            onComplete={() => {
              console.log("Lesson completed!");
            }}
            onClose={() => navigate("/student")}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
