import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import '../Games/Games.css';

const QuizTrioGame = ({ game, onComplete, onSkip }) => {
  const [activeSet] = useState(() => {
    const randomIndex = Math.floor(Math.random() * game.questionSets.length);
    return game.questionSets[randomIndex];
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState([]);

  const question = activeSet.questions[currentQuestion];
  const isLastQuestion = currentQuestion === activeSet.questions.length - 1;
  const allCorrect = questionsAnswered.every(q => q.correct);

  const handleAnswerClick = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correct;
    setAnswerResult(isCorrect ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    // determine correctness for this answer immediately
    const isCorrect = selectedAnswer === question.correct;
    const newAnswered = [...questionsAnswered, {
      questionId: question.id,
      answer: selectedAnswer,
      correct: isCorrect
    }];
    setQuestionsAnswered(newAnswered);

    if (isLastQuestion) {
      // evaluate completion based on the full set including this one
      const allCorrectNow = newAnswered.every(q => q.correct);
      onComplete(allCorrectNow ? 1 : 0);
    } else {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
    }
  };

  return (
    <div className="game-card">
      <div className="game-header">
        <h2>{game.name}</h2>
        <span className="question-counter">
          Question {currentQuestion + 1} of {activeSet.questions.length}
        </span>
      </div>

      <div className="game-content">
        <p className="question-text">{question.question}</p>

        <div className="options-grid">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerClick(option)}
              className={`option-btn ${
                selectedAnswer === option && answerResult === 'correct' ? 'correct' : ''
              } ${
                selectedAnswer === option && answerResult === 'wrong' ? 'wrong' : ''
              }`}
              disabled={!!selectedAnswer}
            >
              {option}
              {selectedAnswer === option && answerResult === 'correct' && (
                <CheckCircle2 size={20} />
              )}
              {selectedAnswer === option && answerResult === 'wrong' && (
                <XCircle size={20} />
              )}
            </button>
          ))}
        </div>

        {answerResult && (
          <div className={`feedback ${answerResult}`}>
            {answerResult === 'correct' ? (
              <p>✅ Correct!</p>
            ) : (
              <p>❌ Wrong! Correct answer: <strong>{question.correct}</strong></p>
            )}
          </div>
        )}
      </div>

      <div className="game-actions">
        <button 
          className="btn-primary" 
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {isLastQuestion ? 'Finish' : 'Next Question'}
        </button>
        <button 
          className="btn-secondary" 
          onClick={onSkip}
          disabled={!!selectedAnswer}
        >
          Skip Game
        </button>
      </div>

      {isLastQuestion && questionsAnswered.length > 0 && (
        <div className="quiz-summary">
          <p>Questions answered: {questionsAnswered.length} / {activeSet.questions.length}</p>
          <p>Correct: {questionsAnswered.filter(q => q.correct).length}</p>
        </div>
      )}
    </div>
  );
};

export default QuizTrioGame;
