import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // New state for personalized Greetings
  const [greetingInput, setGreetingInput] = useState<string>('');
  const [personalizedGreeting, setPersonalizedGreeting] = useState<string>('');

  // New state for personalized Goodbyes
  const [goodbyeInput, setGoodbyeInput] = useState<string>('');
  const [personalizedGoodbye, setPersonalizedGoodbye] = useState<string>('');

  // Load initial hello message
  useEffect(() => {
    fetch('https://localhost:7000/api/hello')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to connect to .NET API');
        setLoading(false);
      });
  }, []);

  // Handle form submission
  const handleGetGreeting = async () => {
    if (!greetingInput.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7000/api/hello/personalized?name=${encodeURIComponent(greetingInput)}`
      );
      const data = await response.json();
      setPersonalizedGreeting(data.message);
    } catch (err) {
      alert('Failed to fetch personalized greeting');
      console.error(err);
    }
  }

    // Handle form submission
  const handleGetGoodbye = async () => {
    if (!greetingInput.trim()) {
      alert('Please enter a name');
      return;
    }
  

    try {
      const response = await fetch(
        `https://localhost:7000/api/hello/goodbye?name=${encodeURIComponent(goodbyeInput)}`
      );
      const data = await response.json();
      setPersonalizedGoodbye(data.message);
    } catch (err) {
      alert('Failed to fetch personalized farewell');
      console.error(err);
    }
  };

  if (loading) return <div className="app">Loading...</div>;
  if (error) return <div className="app error">{error}</div>;

  return (
    <div className="app">
      <h1>🚀 Full-Stack Hello World</h1>

      {/* Original message */}
      <div className="card">
        <h2>Message from .NET:</h2>
        <p className="message">{message}</p>
      </div>

      {/* Interactive form */}
      <div className="card">
        <h2>Get Personalized Greeting:</h2>
        <div className="form">
          <input
            type="text"
            value={greetingInput}
            onChange={(e) => setGreetingInput(e.target.value)}
            placeholder="Enter your name"
            onKeyPress={(e) => e.key === 'Enter' && handleGetGreeting()}
          />
          <button onClick={handleGetGreeting}>
            Get Greeting
          </button>
        </div>

        {personalizedGreeting && (
          <div className="result">
            <p className="message">{personalizedGreeting}</p>
          </div>
        )}
      </div>

      {/* Interactive form */}
      <div className="card">
        <h2>Get Personalized Farewell:</h2>
        <div className="form">
          <input
            type="text"
            value={goodbyeInput}
            onChange={(e) => setGoodbyeInput(e.target.value)}
            placeholder="Enter your name"
            onKeyPress={(e) => e.key === 'Enter' && handleGetGoodbye()}
          />
          <button onClick={handleGetGoodbye}>
            Get Farewell
          </button>
        </div>

        {personalizedGoodbye && (
          <div className="result">
            <p className="message">{personalizedGoodbye}</p>
          </div>
        )}
      </div>


    </div>
  );
}

export default App;