import { useState, useEffect } from 'react';
import { Copy, Check, X, CoffeeIcon, AlertCircle } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

const presetOptions = [
  { id: 'capital', label: 'Capital Letters'},
  { id: 'special', label: 'Special Symbols'},
  { id: 'numbers', label: 'Numbers'},
  { id: 'email', label: 'Email'},
  { id: 'url', label: 'URL'},
];

const Button = ({ onClick, disabled, children, variant = 'primary', className = '' }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 ease-in-out"
  />
);

const Badge = ({ children, active, onClick }) => (
  <span
    onClick={onClick}
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 ${
      active ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
    }`}
  >
    {children}
  </span>
);

const Alert = ({ children, variant = 'info' }) => {
  const variantStyles = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`p-4 rounded-md ${variantStyles[variant]}`}>
      {children}
    </div>
  );
};

function App() {
  const [instructions, setInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTestSuccess, setIsTestSuccess] = useState(null);

  useEffect(() => {
    if (regex && testString) {
      testRegex();
    }
  }, [regex, testString]);

const handleOptionToggle = (option) => {
  setSelectedOptions((prev) => {
    const updatedOptions = prev.includes(option)
      ? prev.filter(o => o !== option)
      : [...prev, option];

    // Update instructions based on selected options
    const updatedInstructions = updatedOptions.map(o => o.label).join(', ');
    setInstructions(updatedInstructions);

    return updatedOptions;
  });
};



  const generateRegex = async () => {
    console.log('instructions', instructions);
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
    if (!regex) {
      setError('Please generate a regex pattern first.');
      return;
    }
    try {
      const re = new RegExp(regex);
      const matchResults = re.test(testString);
      setIsTestSuccess(matchResults);
    } catch (error) {
      setError('Invalid regex pattern. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInstructions('');
    setSelectedOptions([]);
    setRegex('');
    setTestString('');
    setError('');
    setIsTestSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Enhanced Regex Builder</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select preset options or describe your regex needs
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {presetOptions.map(option => (
                  <Badge
                    key={option.id}
                    active={selectedOptions.includes(option)}
                    onClick={() => handleOptionToggle(option)}
                  >
                    {option.label}
                    {selectedOptions.includes(option) && (
                      <X size={14} className="ml-1 inline" />
                    )}
                  </Badge>
                ))}
              </div>
              <TextArea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Match phone numbers, dates, or custom patterns"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={generateRegex}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Generating...' : 'Generate Regex'}
              </Button>
            </div>

            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {error}
              </Alert>
            )}

            {regex && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Generated Regex:</h2>
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    disabled={false}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </Button>
                </div>
                <code className="block bg-white p-3 rounded-lg border break-all text-sm">{regex}</code>
              </div>
            )}

            <div>
              <label htmlFor="testString" className="block text-sm font-medium mb-2">
                Test String
              </label>
              <input
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test the regex"
                style={{
                  border: '1px solid grey',
                  borderRadius: '8px',
                  width: '100%',
                  padding: '10px',
                  outline: 'none'
                }}
              />
            </div>

            {isTestSuccess !== null && (
              <Alert variant={isTestSuccess ? "success" : "error"}>
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {isTestSuccess ? 'Match found' : 'No match found'}
              </Alert>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-sm">
            &copy; 2024 Regex Builder. All rights reserved.
          </p>
          <Button
            variant="ghost"
            onClick={() => window.open('https://buymeacoffee.com/pallavjha', '_blank')}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <CoffeeIcon className="mr-2" />
            Buy Me a Coffee
          </Button>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
