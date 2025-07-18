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

// Popular Imgflip meme templates (2-box only for reliability)
const MEME_TEMPLATES = {
  'Drake Hotline Bling': { id: '181913649', boxes: 2 },
  'Two Buttons': { id: '87743020', boxes: 2 },
  'Change My Mind': { id: '129242436', boxes: 2 },
  'Batman Slapping Robin': { id: '438680', boxes: 2 },
  'UNO Draw 25 Cards': { id: '217743513', boxes: 2 },
  'One Does Not Simply': { id: '61579', boxes: 2 },
  'Waiting Skeleton': { id: '4087833', boxes: 2 },
  'Mocking Spongebob': { id: '102156234', boxes: 2 },
  'Disaster Girl': { id: '97984', boxes: 2 },
  'Woman Yelling At Cat': { id: '188390779', boxes: 2 },
  'X, X Everywhere': { id: '91538330', boxes: 2 },
  'Ancient Aliens': { id: '101470', boxes: 2 },
  'Roll Safe Think About It': { id: '89370399', boxes: 2 },
  'Bernie I Am Once Again Asking For Your Support': { id: '222403160', boxes: 2 },
  'Blank Nut Button': { id: '119139145', boxes: 2 },
  'Tuxedo Winnie The Pooh': { id: '178591752', boxes: 2 },
  'Epic Handshake': { id: '135256802', boxes: 2 },
  'Hide the Pain Harold': { id: '27813981', boxes: 2 },
  'Monkey Puppet': { id: '148909805', boxes: 2 },
  "Y'all Got Any More Of That": { id: '124055727', boxes: 2 },
  'Always Has Been': { id: '252600902', boxes: 2 },
  'Oprah You Get A': { id: '28251713', boxes: 2 },
  'Marked Safe From': { id: '161865971', boxes: 2 },
  "I Bet He's Thinking About Other Women": { id: '110163934', boxes: 2 },
  'Trump Bill Signing': { id: '91545132', boxes: 2 },
  "This Is Where I'd Put My Trophy If I Had One": { id: '3218037', boxes: 2 },
  'This Is Fine': { id: '55311130', boxes: 2 },
  'This is Fine': { id: '55311130', boxes: 2 },
  'Success Kid': { id: '61544', boxes: 2 },
  'Megamind peeking': { id: '370867422', boxes: 2 },
  'Types of Headaches meme': { id: '119215120', boxes: 2 },
  'You Guys are Getting Paid': { id: '177682295', boxes: 2 },
  'where monkey': { id: '316466202', boxes: 2 },
  'Squidward window': { id: '67452763', boxes: 2 },
  'Bernie Sanders Once Again Asking': { id: '224015000', boxes: 2 },
};


// Clean text by removing markdown and symbols
const cleanMemeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '')   // Remove italic markdown
    .replace(/^[-•→>]\s*/, '') // Remove bullet points
    .replace(/^(Top:|Bottom:|Text:|Panel \d+:|Boyfriend:|Girlfriend:|Me:|Him:|Her:|You:|Us:|Them:)\s*/i, '') // Remove labels
    .replace(/^[A-Za-z\s]+:\s*/, '') // Remove any word followed by colon and space
    .replace(/^\[.+?\]\s*/, '') // Remove anything in square brackets at start
    .replace(/\[.+?\]/g, '') // Remove anything in square brackets anywhere
    .replace(/^["']|["']$/g, '') // Remove quotes at start/end
    .replace(/["']/g, '') // Remove any remaining quotes
    .replace(/^\d+\.\s*/, '') // Remove numbered lists
    .replace(/^[:\-\s]+/, '') // Remove colons and dashes at start
    .trim();
};

// Generate meme using Imgflip API with multi-panel support
const generateMemeImage = async (memeFormat, textArray) => {
  try {
    let template = MEME_TEMPLATES[memeFormat];
    
    // Fallback to Drake Hotline Bling if template not found
    if (!template) {
      console.warn('Template not found:', memeFormat, '- using Drake Hotline Bling as fallback');
      template = MEME_TEMPLATES['Drake Hotline Bling'];
    }

    const username = process.env.IMGFLIP_USERNAME;
    const password = process.env.IMGFLIP_PASSWORD;

    // Build params with multiple text boxes
    const params = new URLSearchParams({
      template_id: template.id,
      username: username || 'fallback_username',
      password: password || 'fallback_password'
    });

    // Add text for each box (Imgflip uses text0, text1, text2, text3)
    for (let i = 0; i < Math.min(textArray.length, template.boxes); i++) {
      params.append(`text${i}`, textArray[i] || '');
    }
    
    // For some templates, we might need to fill all possible boxes
    // even if we have fewer text lines
    if (template.boxes > textArray.length) {
      for (let i = textArray.length; i < template.boxes; i++) {
        params.append(`text${i}`, '');
      }
    }

    console.log('Imgflip API params:', Object.fromEntries(params.entries()));

    const response = await axios.post('https://api.imgflip.com/caption_image', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.success) {
      return response.data.data.url;
    } else {
      console.error('Imgflip API error:', response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Meme generation failed:', error.message);
    return null;
  }
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
  const [currentBattlePrompt, setCurrentBattlePrompt] = useState('');

  // Call the spicy agent with function calling
  const callSpicyAgent = async (userPrompt) => {
    const startTime = Date.now();
    
    try {
      // Simulate function calls for demo
      const trends = await mockFunctionCalls.getTrendingTopics();
      const news = await mockFunctionCalls.getCurrentNews();
      
      // Code selects the template randomly to ensure variety
      const templateNames = Object.keys(MEME_TEMPLATES);
      const randomIndex = Math.floor(Math.random() * templateNames.length);
      const selectedTemplate = templateNames[randomIndex];
      console.log('🎲 SPICY AGENT - Code selected template:', selectedTemplate);
      
      const enhancedPrompt = `You are the 🌶️ SPICY AGENT! Create bold, current, and edgy memes that reference real-time trends.

User prompt: "${userPrompt}"

CURRENT TRENDING TOPICS: ${trends.join(', ')}
BREAKING NEWS: ${news.join(', ')}

ASSIGNED TEMPLATE: ${selectedTemplate}

Your task:
1. Create spicy text for the "${selectedTemplate}" meme template
2. Reference current trends and the user's prompt
3. Make it bold, topical, and current
4. This is a 2-box template, so provide exactly 2 lines of text

Return your response in this EXACT format:
**TEXT_OVERLAY:**
[Line 1 - first text box]
[Line 2 - second text box]
**SPICY_COMMENTARY:** [Your spicy take on why this meme works]

CRITICAL: For TEXT_OVERLAY, provide ONLY the text that appears on the meme panels. Do NOT include ANY labels, descriptions, or prefixes like:
- "Top:", "Bottom:", "Panel 1:", "Panel 2:"
- "Boyfriend:", "Girlfriend:", "Him:", "Her:"
- "Me:", "You:", "Us:", "Them:"
- ANY colons (:) followed by descriptions
- ANY square brackets [like this]
- ANY parentheses (like this)

Just provide exactly 2 lines of text - nothing else!

Examples for different templates:
For "Drake Hotline Bling":
**TEXT_OVERLAY:**
Working overtime without AI
Using AI tools while ${trends[0]} is trending
**SPICY_COMMENTARY:** Everyone's switching to AI tools faster than Drake switches his mind! 🔥

For "Two Buttons":
**TEXT_OVERLAY:**
Fix the bug properly
Ship it and hope for the best
**SPICY_COMMENTARY:** The eternal developer dilemma! 🌶️

Create spicy text for the "${selectedTemplate}" template about "${userPrompt}"! 🌶️`;

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
      
      // Extract text overlay only (template is pre-selected by code)
      const chosenTemplate = selectedTemplate;
      
      console.log('🌶️ SPICY AGENT DEBUG:');
      console.log('- Using pre-selected template:', chosenTemplate);
      console.log('- Raw response contains TEXT_OVERLAY:', content.includes('**TEXT_OVERLAY:**'));
      
      
      const textOverlayMatch = content.match(/\*\*TEXT_OVERLAY:\*\*\s*(.+?)(?=\*\*|$)/s);
      const textOverlay = textOverlayMatch ? textOverlayMatch[1].trim() : '';
      
      // Parse text overlay and clean up formatting
      const lines = textOverlay.split('\n').filter(line => line.trim());
      const cleanedLines = lines.map(cleanMemeText).filter(line => line);
      
      // Get template info for the chosen template
      const templateConfig = MEME_TEMPLATES[chosenTemplate] || MEME_TEMPLATES['Drake Hotline Bling'];
      const maxBoxes = templateConfig.boxes;
      
      // Ensure we have enough text lines, use fallbacks if needed
      const textArray = [];
      for (let i = 0; i < maxBoxes; i++) {
        if (i < cleanedLines.length && cleanedLines[i]) {
          textArray.push(cleanedLines[i]);
        } else if (i === 0) {
          textArray.push(userPrompt); // First box fallback
        } else if (i === 1 && maxBoxes === 2) {
          // For 2-box memes, create a contrasting second line
          textArray.push(`Not ${userPrompt}`);
        } else {
          textArray.push(''); // Empty for missing boxes
        }
      }
      
      console.log('Debug - Chosen Template:', chosenTemplate, 'Boxes:', maxBoxes, 'Text Array:', textArray);
      
      // Generate image with chosen template
      const imageUrl = await generateMemeImage(chosenTemplate, textArray);
      
      const tokens = response.data.usage?.total_tokens || 250;
      
      return {
        content,
        imageUrl,
        tokens,
        latency,
        cost: ((tokens / 1000) * 0.002).toFixed(4) // Rough cost estimate
      };
    } catch (error) {
      console.error('Spicy Agent failed:', error.message);
      // Fallback to mock if API fails - generate backup meme
      const trends = await mockFunctionCalls.getTrendingTopics();
      const backupTextArray = [
        'Regular boring content',
        `${trends[0]} while ${userPrompt.toLowerCase()}`
      ];
      
      const backupImageUrl = await generateMemeImage('Drake Hotline Bling', backupTextArray);
      
      return {
        content: `🔥 SPICY MEME BACKUP! 🔥

Based on "${userPrompt}" and trending: ${trends[0]}

**Drake pointing meme:**
👎 Regular boring content  
👍 ${trends[0]} while ${userPrompt.toLowerCase()}

*Note: Using backup response due to API issue*
*Error: ${error.message}*`,
        imageUrl: backupImageUrl,
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
      // Code selects the template randomly to ensure variety
      const templateNames = Object.keys(MEME_TEMPLATES);
      const randomIndex = Math.floor(Math.random() * templateNames.length);
      const selectedClassicTemplate = templateNames[randomIndex];
      console.log('🎲 CLASSIC AGENT - Code selected template:', selectedClassicTemplate);
      
      const classicPrompt = `You are the 🎩 CLASSIC AGENT! Create timeless, nostalgic memes using evergreen formats that never go out of style.

User prompt: "${userPrompt}"

ASSIGNED TEMPLATE: ${selectedClassicTemplate}

Your task:
1. Create timeless text for the "${selectedClassicTemplate}" meme template
2. Reference universal human experiences and the user's prompt
3. Make it nostalgic, clever, and enduring
4. This is a 2-box template, so provide exactly 2 lines of text

Return your response in this EXACT format:
**TEXT_OVERLAY:**
[Line 1 - first text box]
[Line 2 - second text box]
**CLASSIC_COMMENTARY:** [Your timeless wisdom about why this meme endures]

CRITICAL: For TEXT_OVERLAY, provide ONLY the text that appears on the meme panels. Do NOT include ANY labels, descriptions, or prefixes like:
- "Top:", "Bottom:", "Panel 1:", "Panel 2:"
- "Boyfriend:", "Girlfriend:", "Him:", "Her:"
- "Me:", "You:", "Us:", "Them:"
- ANY colons (:) followed by descriptions
- ANY square brackets [like this]
- ANY parentheses (like this)

Just provide exactly 2 lines of text - nothing else!

Examples for different templates:
For "This Is Fine":
**TEXT_OVERLAY:**
This is fine
Everything about ${userPrompt} is complete chaos
**CLASSIC_COMMENTARY:** The eternal human condition - smiling through the chaos! 🎩✨

For "One Does Not Simply":
**TEXT_OVERLAY:**
One does not simply
Handle ${userPrompt} without stress
**CLASSIC_COMMENTARY:** Some truths are eternal - Boromir knew what he was talking about!

Create timeless text for the "${selectedClassicTemplate}" template about "${userPrompt}"! 🎩✨`;

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
      
      // Extract text overlay only (template is pre-selected by code)
      const chosenTemplate = selectedClassicTemplate;
      
      console.log('🎩 CLASSIC AGENT DEBUG:');
      console.log('- Using pre-selected template:', chosenTemplate);
      console.log('- Raw response contains TEXT_OVERLAY:', content.includes('**TEXT_OVERLAY:**'));
      
      
      const textOverlayMatch = content.match(/\*\*TEXT_OVERLAY:\*\*\s*(.+?)(?=\*\*|$)/s);
      const textOverlay = textOverlayMatch ? textOverlayMatch[1].trim() : '';
      
      // Parse text overlay and clean up formatting
      const lines = textOverlay.split('\n').filter(line => line.trim());
      const cleanedLines = lines.map(cleanMemeText).filter(line => line);
      
      // Get template info for the chosen template
      const templateConfig = MEME_TEMPLATES[chosenTemplate] || MEME_TEMPLATES['Drake Hotline Bling'];
      const maxBoxes = templateConfig.boxes;
      
      // Ensure we have enough text lines, use fallbacks if needed
      const textArray = [];
      for (let i = 0; i < maxBoxes; i++) {
        if (i < cleanedLines.length) {
          textArray.push(cleanedLines[i]);
        } else if (i === 0) {
          textArray.push(userPrompt); // First box fallback
        } else {
          textArray.push(''); // Empty for missing boxes
        }
      }
      
      console.log('Debug - Chosen Template:', chosenTemplate, 'Boxes:', maxBoxes, 'Text Array:', textArray);
      
      // Generate image with chosen template
      const imageUrl = await generateMemeImage(chosenTemplate, textArray);
      
      return {
        content,
        imageUrl,
        tokens,
        latency,
        cost: ((tokens / 1000) * 0.0015).toFixed(4) // Rough cost estimate
      };
    } catch (error) {
      console.error('Classic Agent failed:', error.message);
      // Fallback to mock if API fails - generate backup meme
      const backupTextArray = [
        'This is fine',
        `Everything about ${userPrompt.toLowerCase()} is chaos`
      ];
      
      const backupImageUrl = await generateMemeImage('This is Fine', backupTextArray);
      
      return {
        content: `🎩 CLASSIC MEME BACKUP 🎩

Timeless take on "${userPrompt}":

**This is Fine dog meme:**
*Sitting in burning room*
"This is fine"
*Everything about ${userPrompt.toLowerCase()}*

*Note: Using backup response due to API issue*
*Error: ${error.message}*`,
        imageUrl: backupImageUrl,
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
    
    // Set the current battle prompt for display and clear input
    const currentPrompt = prompt;
    setCurrentBattlePrompt(currentPrompt);
    setPrompt('');

    try {
      // Call both agents in parallel
      const [spicyResult, classicResult] = await Promise.all([
        callSpicyAgent(currentPrompt),
        callClassicAgent(currentPrompt)
      ]);

      setResponses({
        spicy: { content: spicyResult.content, imageUrl: spicyResult.imageUrl },
        classic: { content: classicResult.content, imageUrl: classicResult.imageUrl }
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
        spicy: { content: 'Error: Failed to generate spicy meme 🌶️💥', imageUrl: null },
        classic: { content: 'Error: Failed to generate classic meme 🎩❌', imageUrl: null }
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
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleBattle()}
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

      {currentBattlePrompt && (
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '1.2rem',
          color: '#ffd700',
          fontWeight: 'bold'
        }}>
          <span style={{color: '#fff'}}>Battle Prompt:</span> "{currentBattlePrompt}"
        </div>
      )}

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
              <div>
                {responses.spicy.imageUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={responses.spicy.imageUrl} 
                      alt="Spicy meme" 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: '8px',
                        border: '2px solid #ff6b35'
                      }} 
                    />
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {responses.spicy.content}
                  </div>
                )}
              </div>
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
              <div>
                {responses.classic.imageUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={responses.classic.imageUrl} 
                      alt="Classic meme" 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: '8px',
                        border: '2px solid #8b4513'
                      }} 
                    />
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {responses.classic.content}
                  </div>
                )}
              </div>
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

      {(responses.spicy?.content || responses.classic?.content) && !loading && (
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