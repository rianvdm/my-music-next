'use client';
import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GuessMe() {
  const [userGuess, setUserGuess] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [correctName, setCorrectName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [gameDataLoading, setGameDataLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    const initialMessage =
      "Welcome to today's game! You can ask me (almost) anything. My hints might seem vague, but pay close attention to the details and you'll figure it out...";
    setCurrentAnswer(initialMessage);
    inputRef.current?.focus();

    // Fetch game data from KV store
    const fetchGameData = async () => {
      setGameDataLoading(true);
      try {
        const response = await fetch('https://personality-api.rian-db8.workers.dev/api/game-data');
        if (response.ok) {
          const data = await response.json();
          setGameData(data);
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setGameDataLoading(false);
      }
    };

    fetchGameData();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  });

  const handleGuess = async () => {
    if (!userGuess.trim()) {
      return;
    }
    setLoading(true);
    try {
      const promptWithContext = `${userGuess}`;
      const response = await fetch(
        `https://api-openai-personalities.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptWithContext)}`
      );
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
          <div
            className="correct-guess track_ul2"
            style={{ marginTop: '20px', fontWeight: 'bold', color: 'green' }}
          >
            Congratulations! You've correctly guessed that the musical personality is {correctName}.
            Come back tomorrow for a new game!
          </div>
        )}
      </>
    );
  };

  const formatDate = dateString => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="track_ul2">
      <h1>Guess the Music Personality</h1>
      {gameDataLoading ? (
        <LoadingSpinner variant="data" showSpinner={true} />
      ) : gameData ? (
        <h3 style={{ textAlign: 'center' }}>
          Guess Me #{gameData.gameVersion}: {formatDate(gameData.gameDate)}
        </h3>
      ) : null}
      <div id="search-form" style={{ marginBottom: '20px' }}>
        <Input
          ref={inputRef}
          variant="expandable"
          value={userGuess}
          onChange={e => setUserGuess(e.target.value)}
          placeholder="Enter your question or guess..."
          disabled={loading || isCorrectGuess}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleGuess();
            }
          }}
        />
        <Button
          onClick={handleGuess}
          disabled={!userGuess.trim() || isCorrectGuess}
          loading={loading}
        >
          Ask or Guess
        </Button>
      </div>
      <div className="conversation-container">{renderCurrentQA()}</div>
    </div>
  );
}
