import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function App() {
  const [instructions, setInstructions] = useState('');
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRegex = async () => {
    setIsLoading(true);
    setError('');
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a regex expert. Generate a regex pattern based on the user's instructions. Respond with only the regex pattern, no explanations." },
          { role: "user", content: instructions }
        ],
        model: "gpt-3.5-turbo",
      });

      const generatedRegex = completion.choices[0].message.content?.trim() || '';
      setRegex(generatedRegex);
    } catch (err) {
      console.error('Error generating regex:', err);
      setError('Failed to generate regex. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testRegex = () => {
    try {
      const re = new RegExp(regex, 'gi');
      const matchResults = testString.match(re);
      setMatches(matchResults || []);
    } catch (error) {
      setMatches([]);
      setError('Invalid regex pattern. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">AI-Powered Regex Builder</h1>
        
        <div className="mb-4">
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your regex needs
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="e.g., Match email addresses, phone numbers, URLs, dates, or times"
          ></textarea>
        </div>

        <button
          onClick={generateRegex}
          disabled={isLoading}
          className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="animate-spin mr-2">&#9696;</span>
          ) : (
            <Wand2 className="mr-2" size={20} />
          )}
          {isLoading ? 'Generating...' : 'Generate Regex'}
        </button>

        {error && (
          <div className="mt-4 text-red-500">{error}</div>
        )}

        {regex && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Generated Regex:</h2>
            <code className="block bg-gray-100 p-2 rounded break-all">{regex}</code>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="testString" className="block text-sm font-medium text-gray-700 mb-1">
            Test String
          </label>
          <textarea
            id="testString"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Enter text to test the regex"
          ></textarea>
        </div>

        <button
          onClick={testRegex}
          className="w-full mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Test Regex
        </button>

        {matches.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Matches:</h2>
            <ul className="list-disc pl-5">
              {matches.map((match, index) => (
                <li key={index} className="text-gray-700">{match}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;