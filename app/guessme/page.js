'use client';
import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

export default function GuessMe() {
    const [userGuess, setUserGuess] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCorrectGuess, setIsCorrectGuess] = useState(false);
    const [correctName, setCorrectName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const initialMessage = "Welcome to today's Guess the Musical Personality game! Ask me (almost) anything. My hints might seem vague, but pay close attention to the details and you'll figure it out...";
        setCurrentAnswer(initialMessage);
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    });

    const handleGuess = async () => {
        if (!userGuess.trim()) return;
        setLoading(true);
        try {
            const promptWithContext = `user: ${userGuess}`;
            const response = await fetch(`https://api-openai-personalities.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptWithContext)}`);
            const data = await response.json();
            setCurrentQuestion(userGuess);
            setCurrentAnswer(data.response);
            setIsCorrectGuess(data.isCorrectGuess);
            if (data.isCorrectGuess) {
                setCorrectName(data.correctName);
            }
        } catch (error) {
            console.error('Error submitting guess:', error);
            setCurrentAnswer('Failed to submit your guess. Please try again.');
        } finally {
            setLoading(false);
            setUserGuess('');
        }
    };

    const renderCurrentQA = () => {
        return (
            <>
                {currentQuestion && (
                    <div className="user track_ul2" style={{ marginBottom: '0' }}>
                        <strong>Q: </strong>
                        <span>{currentQuestion}</span>
                    </div>
                )}
                <div className="assistant track_ul2" style={{ marginBottom: '0' }}>
                    <span dangerouslySetInnerHTML={{ __html: marked(currentAnswer) }} />
                </div>
                {isCorrectGuess && (
                    <div className="correct-guess track_ul2" style={{ marginTop: '20px', fontWeight: 'bold', color: 'green' }}>
                        Congratulations! You've correctly guessed that the musical personality is {correctName}. 
                        Come back tomorrow for a new game!
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="track_ul2">
            <h1>Guess the Musical Personality!</h1>
            <h3 style={{ textAlign: 'center' }}>Guess Me #1: October 6, 2024</h3>
            <div id="search-form" style={{ marginBottom: '20px' }}>
                <input
                    ref={inputRef}
                    id="follow-up-search"
                    type="text"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    placeholder="Enter your question or guess..."
                    disabled={loading || isCorrectGuess}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleGuess();
                        }
                    }}
                />
                <button 
                    className="button"
                    onClick={handleGuess} 
                    disabled={loading || !userGuess.trim() || isCorrectGuess}
                >
                    {loading ? 'Thinking...' : 'Ask or Guess'}
                </button>
            </div>
            <div className="conversation-container">
                {renderCurrentQA()}
            </div>
        </div>
    );
}