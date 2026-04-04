import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import '../Games/Games.css';

const TrueFalseGame = ({ game, onComplete, onSkip }) => {
    const [currentStatement, setCurrentStatement] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

    const statements = game.statements;
    const statement = statements[currentStatement];
    const isComplete = currentStatement >= statements.length;

    const handleAnswer = (answer) => {
        const isCorrect = answer === statement.isTrue;
        setLastAnswerCorrect(isCorrect);
        if (isCorrect) setScore(score + 1);
        setShowExplanation(true);
    };

    const handleNext = () => {
        setShowExplanation(false);
        setCurrentStatement(currentStatement + 1);
    };

    const handleSubmit = () => {
        // Only award marks if all statements were answered correctly
        const pointsEarned = score === statements.length ? game.marks : 0;
        onComplete(pointsEarned, { total: statements.length, correct: score });
    };

    if (isComplete) {
        return (
            <div className="game-card">
                <div className="game-header text-center">
                    <h2>Game Complete!</h2>
                    <p>You answered {score} out of {statements.length} correctly.</p>
                </div>
                <div className="game-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn-primary" onClick={handleSubmit}>
                        {score === statements.length ? (
                            <><CheckCircle2 size={20} /> Collect Marks</>
                        ) : (
                            <><XCircle size={20} /> Finish (Retry for Marks)</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-card true-false-game">
            <div className="game-header">
                <h2>{game.name}</h2>
                <p>Statement {currentStatement + 1} of {statements.length}</p>
            </div>

            <div className="statement-container text-center" style={{ margin: '30px 0' }}>
                <h3 style={{ fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '20px', color: '#000000'}}>
                    "{statement.text}"
                </h3>

                {!showExplanation ? (
                    <div className="game-actions" style={{ justifyContent: 'center', gap: '20px'}}>
                        <button
                            className="btn-primary"
                            onClick={() => handleAnswer(true)}
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                            <CheckCircle2 size={20} /> True
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => handleAnswer(false)}
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                        >
                            <XCircle size={20} /> False
                        </button>
                    </div>
                ) : (
                    <div className={`explanation-box ${lastAnswerCorrect ? 'correct' : 'incorrect'}`} style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: lastAnswerCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${lastAnswerCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '10px',
                            color: lastAnswerCorrect ? '#10b981' : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>
                            {lastAnswerCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            {lastAnswerCorrect ? 'Correct!' : 'Incorrect!'}
                        </div>

                        <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#000000'}}>
                            <strong>Fact:</strong> {statement.explanation}
                        </p>

                        <button className="btn-primary" onClick={handleNext}>
                            Next Statement
                        </button>
                    </div>
                )}
            </div>

            <div className="game-actions" style={{ marginTop: 'auto' }}>
                <p style={{ opacity: 0.7 }}>Score: {score}</p>
                <button className="btn-secondary" onClick={onSkip}>
                    Skip Game
                </button>
            </div>
        </div>
    );
};

export default TrueFalseGame;
