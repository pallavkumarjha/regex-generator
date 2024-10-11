import { useState, useEffect } from 'react';
import { Wand2, Copy, Check, X, RefreshCw } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production
})

const presetOptions = [
  { id: 'capital', label: 'Capital Letters', regex: '[A-Z]' },
  { id: 'special', label: 'Special Symbols', regex: '[!@#$%^&*(),.?":{}|<>]' },
  { id: 'numbers', label: 'Numbers', regex: '\d' },
  { id: 'email', label: 'Email', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' },
  { id: 'url', label: 'URL', regex: 'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)' },
];

function App() {
  const [instructions, setInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState('');
  // const [isAiFixing, setIsAiFixing] = useState(false)

  useEffect(() => {
    if (regex) {
      testRegex();
    }
  }, [regex, testString]);

  const handleOptionToggle = (option: any) => { // Use 'any' type for option
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    );
  };

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
      console.log('generatedRegex', generatedRegex)
      setRegex(generatedRegex);
    } catch (err) {
      console.error('Error generating regex:', err);
      setError('Failed to generate regex. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testRegex = () => {
    setMatches([]);
    setError('');
    if (!regex || regex === 'No regex pattern generated') {
      setError('Please generate a regex pattern first.');
      return;
    }
    if (!testString.trim()) {
      setError('Please enter a test string.');
      return;
    }
    try {
      const re = new RegExp(regex, 'gi');
      const matchResults = testString.match(re);
      setMatches(matchResults || []);
    } catch (error) {
      setError('Invalid regex pattern. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateResults = () => {
    if (!regex || regex === 'No regex pattern generated') {
      setError('Please generate a regex pattern first.');
      return;
    }
    setResults(`Regex Pattern: ${regex}\n\nTest String: ${testString}\n\nMatches: ${matches.join(', ') || 'No matches found'}`);
  };

  const clearAll = () => {
    setInstructions('');
    setSelectedOptions([]);
    setRegex('');
    setTestString('');
    setMatches([]);
    setError('');
    setResults('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Enhanced Regex Builder</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">
            Select preset options or describe your regex needs
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {presetOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 flex items-center
                  ${
                    selectedOptions.includes(option)
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
              >
                {option.label}
                {selectedOptions.includes(option) && (
                  <X size={14} className="ml-1 text-white" />
                )}
              </button>
            ))}
          </div>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out"
            rows={3}
            placeholder="e.g., Match phone numbers, dates, or custom patterns"
          ></textarea>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateRegex}
            disabled={isLoading}
            className="flex-1 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ease-in-out flex items-center justify-center text-lg font-medium"
          >
            {isLoading ? (
              <span className="animate-spin mr-2">&#9696;</span>
            ) : (
              <Wand2 className="mr-2" size={20} />
            )}
            {isLoading ? 'Generating...' : 'Generate Regex'}
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 ease-in-out flex items-center justify-center"
          >
            <RefreshCw size={20} className="mr-2" />
            Clear All
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-center">{error}</div>
        )}

        {regex && (
          <div className="mt-6 bg-black p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-white">Generated Regex:</h2>
              <button
                onClick={copyToClipboard}
                className="text-black hover:text-gray-200 transition-colors duration-200 ease-in-out p-1 rounded-full hover:bg-gray-700"
                title="Copy to clipboard"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <code className="block bg-white text-black p-3 rounded-lg border border-gray-200 break-all text-sm">{regex}</code>
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="testString" className="block text-sm font-medium text-black mb-2">
            Test String
          </label>
          <textarea
            id="testString"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out"
            rows={3}
            placeholder="Enter text to test the regex"
          ></textarea>
        </div>

        <button
          onClick={generateResults}
          className="w-full mt-4 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ease-in-out text-lg font-medium"
        >
          Generate Results
        </button>

        {results && (
          <div className="mt-6 bg-black p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-white">Results:</h2>
            <pre className="whitespace-pre-wrap text-sm text-white">{results}</pre>
          </div>
        )}
      </div>
      <Analytics/>
    </div>
  );
}

export default App;
