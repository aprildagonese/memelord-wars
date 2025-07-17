import React, { useState } from 'react';
import axios from 'axios';

// Mock function calling endpoints
const mockFunctionCalls = {
  getTrendingTopics: () => Promise.resolve([
    "ChatGPT-5 rumors",
    "AI safety debate",
    "Nvidia stock surge",
    "Remote work memes"
  ]),
  getCurrentNews: () => Promise.resolve([
    "Tech layoffs continue",
    "AI regulation hearing",
    "Startup funding down 40%"
  ]),
  getStockPrice: (symbol) => Promise.resolve({
    symbol,
    price: Math.floor(Math.random() * 500) + 100,
    change: (Math.random() - 0.5) * 20
  })
};

// Configuration from environment variables
const AGENT_CONFIG = {
  spicy: {
    name: "🌶️ Spicy Agent",
    description: "Real-time data access, trending topics, breaking news",
    endpoint: process.env.REACT_APP_SPICY_AGENT_ENDPOINT || process.env.DO_ENDPOINT,
    apiKey: process.env.REACT_APP_SPICY_AGENT_API_KEY || process.env.MODEL_ACCESS_KEY,
    model: process.env.REACT_APP_SPICY_MODEL || "deepseek-r1-distill-llama-70b"
  },
  classic: {
    name: "🎩 Classic Agent", 
    description: "Timeless humor, universal experiences, nostalgic vibes",
    endpoint: process.env.REACT_APP_CLASSIC_AGENT_ENDPOINT || 'https://inference.do-ai.run/v1/chat/completions',
    apiKey: process.env.REACT_APP_CLASSIC_AGENT_API_KEY || process.env.REACT_APP_MODEL_ACCESS_KEY || 'sk-do-tL1QQa1HLk8TAwGsebDQbjh0QsfO675Gfp8IfBu8yWDirzDOihnm1SAwMG',
    model: process.env.REACT_APP_CLASSIC_MODEL || "llama3.3-70b-instruct"
  }
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({
    spicy: null,
    classic: null
  });
  const [metrics, setMetrics] = useState({
    spicy: null,
    classic: null
  });

  // Call the spicy agent with function calling
  const callSpicyAgent = async (userPrompt) => {
    const startTime = Date.now();
    
    try {
      // Simulate function calls for demo
      const trends = await mockFunctionCalls.getTrendingTopics();
      const news = await mockFunctionCalls.getCurrentNews();
      
      const spicyFormats = [
        'Drake pointing', 'Distracted boyfriend', 'This is Fine', 'Expanding Brain', 
        'Surprised Pikachu', 'Woman yelling at cat', 'Two buttons', 'Arthur\'s fist',
        'Stonks', 'Galaxy brain', 'Change my mind', 'Roll safe', 'Awkward penguin'
      ];
      const randomFormat = spicyFormats[Math.floor(Math.random() * spicyFormats.length)];

      const enhancedPrompt = `You are the 🌶️ SPICY AGENT! Create bold, current, and edgy memes that reference real-time trends.

User prompt: "${userPrompt}"

CURRENT TRENDING TOPICS: ${trends.join(', ')}
BREAKING NEWS: ${news.join(', ')}

Create a spicy meme that:
1. References the user's prompt
2. Incorporates current trends/news
3. Uses the ${randomFormat} meme format specifically
4. Is bold and topical
5. Includes relevant emojis

Focus on the ${randomFormat} format for this response. Be creative and spicy! 🌶️🔥`;

      // GradientAI agent endpoint - correct format
      console.log('Attempting API call to:', `${AGENT_CONFIG.spicy.endpoint}/api/v1/chat/completions`);
      
      const response = await axios.post(`${AGENT_CONFIG.spicy.endpoint}/api/v1/chat/completions`, {
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${AGENT_CONFIG.spicy.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const latency = Date.now() - startTime;
      // DeepSeek R1 includes reasoning tokens - extract actual response
      let content = response.data.choices[0].message.content;
      
      // Remove <think> tags and reasoning content - improved filtering
      if (content.includes('<think>')) {
        const thinkEnd = content.lastIndexOf('</think>');
        if (thinkEnd !== -1) {
          content = content.substring(thinkEnd + 8).trim();
        }
      }
      
      // Also handle cases where there might be incomplete thinking tags
      content = content.replace(/<think>.*?<\/think>/gs, '').trim();
      
      const tokens = response.data.usage?.total_tokens || 250;
      
      return {
        content,
        tokens,
        latency,
        cost: ((tokens / 1000) * 0.002).toFixed(4) // Rough cost estimate
      };
    } catch (error) {
      console.error('Spicy Agent failed:', error.message);
      // Fallback to mock if API fails
      const trends = await mockFunctionCalls.getTrendingTopics();
      return {
        content: `🔥 SPICY MEME BACKUP! 🔥

Based on "${userPrompt}" and trending: ${trends[0]}

**Drake pointing meme:**
👎 Regular boring content  
👍 ${trends[0]} while ${userPrompt.toLowerCase()}

*Note: Using backup response due to API issue*
*Error: ${error.message}*`,
        tokens: 180,
        latency: Date.now() - startTime,
        cost: "0.0036"
      };
    }
  };

  // Call the classic agent
  const callClassicAgent = async (userPrompt) => {
    const startTime = Date.now();
    
    try {
      const classicFormats = [
        'This is Fine', 'Distracted Boyfriend', 'Drake pointing', 'Expanding Brain',
        'Surprised Pikachu', 'Arthur\'s fist', 'Two buttons', 'Change my mind',
        'Roll safe', 'First time?', 'Always has been', 'Awkward penguin'
      ];
      const randomClassicFormat = classicFormats[Math.floor(Math.random() * classicFormats.length)];

      const classicPrompt = `You are the 🎩 CLASSIC AGENT! Create timeless, nostalgic memes using evergreen formats that never go out of style.

User prompt: "${userPrompt}"

Create a classic meme that:
1. Uses the ${randomClassicFormat} meme format specifically
2. References universal human experiences
3. Has nostalgic or throwback vibes
4. Works regardless of current trends
5. Is clever and relatable

Focus on the ${randomClassicFormat} format for this response. Create timeless humor that will be funny years from now! 🎩✨`;

      // Classic Agent configured with dedicated endpoint
      
      const response = await axios.post(`${AGENT_CONFIG.classic.endpoint}/api/v1/chat/completions`, {
        model: AGENT_CONFIG.classic.model,
        messages: [
          {
            role: "user",
            content: classicPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${AGENT_CONFIG.classic.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      const latency = Date.now() - startTime;
      const content = response.data.choices[0].message.content;
      const tokens = response.data.usage?.total_tokens || 200;
      
      return {
        content,
        tokens,
        latency,
        cost: ((tokens / 1000) * 0.0015).toFixed(4) // Rough cost estimate
      };
    } catch (error) {
      console.error('Classic Agent failed:', error.message);
      // Fallback to mock if API fails
      return {
        content: `🎩 CLASSIC MEME BACKUP 🎩

Timeless take on "${userPrompt}":

**This is Fine dog meme:**
*Sitting in burning room*
"This is fine"
*Everything about ${userPrompt.toLowerCase()}*

**Distracted boyfriend meme:**
Boyfriend: Me
Girlfriend: Responsibilities  
Other woman: ${userPrompt.toLowerCase()}

*Note: Using backup response due to API issue*
*Error: ${error.message}*`,
        tokens: 150,
        latency: Date.now() - startTime,
        cost: "0.0030"
      };
    }
  };

  const handleBattle = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponses({ spicy: null, classic: null });
    setMetrics({ spicy: null, classic: null });
    
    // Clear the input for next battle
    const currentPrompt = prompt;
    setPrompt('');

    try {
      // Call both agents in parallel
      const [spicyResult, classicResult] = await Promise.all([
        callSpicyAgent(currentPrompt),
        callClassicAgent(currentPrompt)
      ]);

      setResponses({
        spicy: spicyResult.content,
        classic: classicResult.content
      });

      setMetrics({
        spicy: {
          tokens: spicyResult.tokens,
          latency: spicyResult.latency,
          cost: spicyResult.cost
        },
        classic: {
          tokens: classicResult.tokens,
          latency: classicResult.latency,
          cost: classicResult.cost
        }
      });
    } catch (error) {
      console.error('Battle failed:', error);
      setResponses({
        spicy: 'Error: Failed to generate spicy meme 🌶️💥',
        classic: 'Error: Failed to generate classic meme 🎩❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">MEMELORD WARS</h1>
        <p className="subtitle">
          Two AI agents enter, one meme wins! Powered by DigitalOcean GradientAI Platform
        </p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label className="input-label">
            Enter your meme prompt:
          </label>
          <input
            type="text"
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Monday mornings', 'AI conferences', 'debugging at 3am'"
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleBattle()}
          />
        </div>
        
        <button
          className="battle-button"
          onClick={handleBattle}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'BATTLE IN PROGRESS...' : 'START THE BATTLE! ⚔️'}
        </button>
      </div>

      <div className="agents-container">
        <div className="agent-card spicy-agent">
          <h3 className="agent-name">{AGENT_CONFIG.spicy.name}</h3>
          <p className="agent-description">{AGENT_CONFIG.spicy.description}</p>
          <p style={{textAlign: 'center', fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px'}}>
            Model: {AGENT_CONFIG.spicy.model}
          </p>
          
          <div className="agent-response">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Generating spicy meme...
              </div>
            ) : responses.spicy ? (
              responses.spicy
            ) : (
              <div style={{color: '#999', fontStyle: 'italic', textAlign: 'center', paddingTop: '80px'}}>
                Ready to serve some 🌶️ spicy memes!
              </div>
            )}
          </div>

          {metrics.spicy && (
            <div className="metrics">
              <div className="metric">
                <span>Tokens</span>
                <span className="metric-value">{metrics.spicy.tokens}</span>
              </div>
              <div className="metric">
                <span>Latency</span>
                <span className="metric-value">{metrics.spicy.latency}ms</span>
              </div>
              <div className="metric">
                <span>Cost</span>
                <span className="metric-value">${metrics.spicy.cost}</span>
              </div>
            </div>
          )}
        </div>

        <div className="agent-card classic-agent">
          <h3 className="agent-name">{AGENT_CONFIG.classic.name}</h3>
          <p className="agent-description">{AGENT_CONFIG.classic.description}</p>
          <p style={{textAlign: 'center', fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px'}}>
            Model: {AGENT_CONFIG.classic.model}
          </p>
          
          <div className="agent-response">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Crafting timeless humor...
              </div>
            ) : responses.classic ? (
              responses.classic
            ) : (
              <div style={{color: '#999', fontStyle: 'italic', textAlign: 'center', paddingTop: '80px'}}>
                Ready to deliver 🎩 classic gold!
              </div>
            )}
          </div>

          {metrics.classic && (
            <div className="metrics">
              <div className="metric">
                <span>Tokens</span>
                <span className="metric-value">{metrics.classic.tokens}</span>
              </div>
              <div className="metric">
                <span>Latency</span>
                <span className="metric-value">{metrics.classic.latency}ms</span>
              </div>
              <div className="metric">
                <span>Cost</span>
                <span className="metric-value">${metrics.classic.cost}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {(responses.spicy || responses.classic) && !loading && (
        <div style={{textAlign: 'center', marginTop: '30px', fontSize: '1.2rem'}}>
          <p>🗳️ <strong>Audience Vote:</strong> Which meme wins this round?</p>
          <p style={{fontSize: '0.9rem', opacity: 0.8, marginTop: '10px'}}>
            Raise your hands for your favorite!
          </p>
        </div>
      )}
    </div>
  );
}

export default App;