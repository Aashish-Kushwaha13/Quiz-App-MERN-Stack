import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const staticQuizData = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "J.K. Rowling", "Ernest Hemingway", "Mark Twain"],
    answer: "Harper Lee",
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Pb", "Fe"],
    answer: "Au",
  },
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    answer: "7",
  },
  {
    question: "Who developed the theory of relativity?",
    options: [
      "Isaac Newton",
      "Nikola Tesla",
      "Albert Einstein",
      "Galileo Galilei",
    ],
    answer: "Albert Einstein",
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answer: "Carbon Dioxide",
  },
  {
    question: "What is the largest ocean on Earth?",
    options: [
      "Atlantic Ocean",
      "Indian Ocean",
      "Arctic Ocean",
      "Pacific Ocean",
    ],
    answer: "Pacific Ocean",
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Tomato", "Avocado", "Cucumber", "Onion"],
    answer: "Avocado",
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Oxygen", "Hydrogen", "Helium", "Nitrogen"],
    answer: "Hydrogen",
  },
];

const QuizApp = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(
    Array(staticQuizData.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [username, setUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (quizStarted && !quizFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            handleNextQuestion(); // Auto move to next question if time runs out
            return 10; // Reset timer
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, currentQuestion, quizFinished]);

  const handleOptionClick = (option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentQuestion] = option;
    setSelectedOptions(updatedOptions);
  };

  const handleNextQuestion = () => {
    if (
      selectedOptions[currentQuestion] ===
      staticQuizData[currentQuestion].answer
    ) {
      setScore((prevScore) => prevScore + 1);
    }
    if (currentQuestion + 1 < staticQuizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(10); // Reset timer for the next question
    } else {
      setQuizFinished(true);
    }
  };

  const handleSubmitResult = async () => {
    if (!username.trim()) {
      toast.error("Please enter your name before submitting!");
      return;
    }

    // Ensure staticQuizData is not undefined
    if (!staticQuizData || staticQuizData.length === 0) {
      toast.error("Quiz data not loaded!");
      return;
    }

    try {
      const response = await fetch("https://quiz-app-mern-stack-tan.vercel.app/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          score,
          totalQuestions: staticQuizData.length,
        }),
      });

      let resultMessage = "Unknown error occurred!";

      if (response.ok) {
        resultMessage = "🎉 Result saved successfully!";
        toast.success(resultMessage);
      } else {
        try {
          const data = await response.json();
          resultMessage = data.error || resultMessage;
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
        toast.error(resultMessage);
      }

      setMessage(resultMessage); // Update message on screen
    } catch (error) {
      console.error("Fetch Error:", error);
      const errorMessage = "Server error: " + error.message;
      toast.error(errorMessage);
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
      {!quizStarted ? (
        <motion.div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h1 className="text-4xl font-extrabold mb-4">Welcome to the Quiz</h1>
          <p className="text-lg mb-6 text-gray-200">
            Enter your name to begin!
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 rounded-lg text-gray-800"
          />
          <button
            className="px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition text-lg"
            onClick={() => {
              if (username.trim()) {
                setQuizStarted(true);
                setTimeLeft(10); // Start timer
              } else {
                toast.error("Please enter your name!");
              }
            }}
          >
            Start Quiz
          </button>
        </motion.div>
      ) : quizFinished ? (
        <motion.div
          className="p-8 bg-white text-gray-800 rounded-2xl shadow-xl text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-green-600 mb-4">
            🎉 Quiz Completed!
          </h1>
          <p className="text-xl font-semibold mb-6">
            Your Score:{" "}
            <span className="text-blue-500">
              {score}/{staticQuizData.length}
            </span>
          </p>

          {/* Submit & Try Again Buttons */}
          <div className="flex flex-col items-center space-y-4">
            <button
              className="w-60 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg 
      hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 
      font-bold text-lg"
              onClick={handleSubmitResult}
            >
              🚀 Submit Result
            </button>

            <button
              className="w-60 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl shadow-lg 
      hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 
      font-semibold text-lg"
              onClick={() => window.location.reload()}
            >
              🔄 Try Again
            </button>
          </div>

          {/* Success/Error Message */}
          {message && (
            <motion.p
              className={`text-lg font-semibold mt-6 ${
                message.includes("success") ? "text-green-600" : "text-red-600"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <motion.div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-lg font-semibold text-gray-200 mb-2">
            Question {currentQuestion + 1} of {staticQuizData.length}
          </h2>
          <h1 className="text-2xl font-bold mb-4">
            {staticQuizData[currentQuestion].question}
          </h1>

          {/* Timer Display */}
          <div className="text-xl font-bold mb-4 bg-red-500 text-white py-2 px-4 rounded-lg inline-block">
            ⏳ Time Left: {timeLeft} sec
          </div>

          <div className="flex flex-col space-y-3">
            {staticQuizData[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition ${
                  selectedOptions[currentQuestion] === option
                    ? "bg-yellow-400 text-blue-900"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setTimeLeft(10); // Reset timer when going back
                }
              }}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              onClick={handleNextQuestion}
              disabled={!selectedOptions[currentQuestion]}
            >
              {currentQuestion + 1 === staticQuizData.length
                ? "Finish Quiz"
                : "Next"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizApp;
