# Memelord Wars

An AI-powered meme generation battle demo built with React and DigitalOcean's GradientAI Platform.

## Overview

Memelord Wars showcases the power of DigitalOcean's GradientAI Platform through an entertaining demo where two specialized AI agents compete to create the best memes:

- **🌶️ Spicy Agent** - Uses DeepSeek R1 Distill Llama 70B with simulated real-time data access for current, trend-aware memes
- **🎩 Classic Agent** - Uses Llama 3.3 70B with timeless humor focusing on universal human experiences

## Features

- **Multi-agent orchestration** - Two specialized agents with different personalities and capabilities
- **Knowledge base integration** - RAG capabilities with crawled and uploaded data
- **Function calling simulation** - Enhanced prompts with "real-time" data for the Spicy Agent
- **Performance monitoring** - Real-time token usage, latency, and cost tracking
- **Meme format variety** - Random selection from 12+ different meme formats per agent
- **Error resilience** - Graceful fallbacks and backup responses
- **Modern UI** - Clean, responsive design optimized for demo presentations

## Technology Stack

- **Frontend**: React 18.2.0 with modern CSS
- **Backend**: DigitalOcean GradientAI Platform
- **Models**: DeepSeek R1 Distill Llama 70B (Spicy) and Llama 3.3 70B (Classic)
- **Build Tools**: Create React App
- **Deployment**: Static build with serve

## Setup Instructions

### Prerequisites
- Node.js and npm
- DigitalOcean account with GradientAI Platform access
- Two created agents (Spicy and Classic) with their respective endpoints and API keys

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd summit_demo
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```bash
# Spicy Agent (with function calling capabilities)
REACT_APP_SPICY_AGENT_ENDPOINT=your_spicy_agent_endpoint
REACT_APP_SPICY_AGENT_API_KEY=your_spicy_agent_api_key

# Classic Agent (timeless humor)
REACT_APP_CLASSIC_AGENT_ENDPOINT=your_classic_agent_endpoint
REACT_APP_CLASSIC_AGENT_API_KEY=your_classic_agent_api_key

# Model configurations
REACT_APP_SPICY_MODEL=deepseek-r1-distill-llama-70b
REACT_APP_CLASSIC_MODEL=llama3.3-70b-instruct
```

### Running the Application

**Development mode:**
```bash
npm start
```

**Production build:**
```bash
npm run build
npx serve -s build -l 3000
```

## Agent Setup

### Spicy Agent
- **Model**: DeepSeek R1 Distill Llama 70B
- **Temperature**: 0.8
- **Knowledge Base**: 
  - Upload: `spicy_agent_knowledge_base.md`
  - Crawl: `knowyourmeme.com` and `news.ycombinator.com`
- **Instructions**: Use content from `spicy_agent_instructions.md`

### Classic Agent
- **Model**: Llama 3.3 70B Instruct
- **Temperature**: 0.7
- **Knowledge Base**:
  - Upload: `classic_agent_knowledge_base.md`
  - Crawl: `https://knowyourmeme.com/memes/popular/year/2015`
- **Instructions**: Use content from `classic_agent_instructions.md`

## Demo Flow

1. **Introduction** (30s): Explain the concept and agents
2. **Audience Interaction** (1min): Get prompt suggestion from crowd
3. **Battle Initiation** (30s): Show both agents processing
4. **Real-time Display** (2-3min): Watch agents generate memes in parallel
5. **Results** (1-2min): Side-by-side comparison with performance metrics
6. **Audience Voting** (30s): Manual voting by show of hands
7. **Wrap-up** (30s): Highlight platform capabilities

## Platform Features Demonstrated

- **Agent Creation**: Custom AI agents with specialized instructions
- **Knowledge Base Integration**: RAG with multiple data sources
- **Model Selection**: Different models for different use cases
- **Function Calling**: Real-time data integration (simulated)
- **Performance Monitoring**: Token usage and cost tracking
- **Error Handling**: Graceful fallbacks and backup responses

## Project Structure

```
summit_demo/
├── public/                 # Static files
├── src/
│   ├── App.js             # Main application logic
│   ├── index.js           # React entry point
│   └── index.css          # Styles
├── spicy_agent_instructions.md      # Spicy Agent setup guide
├── spicy_agent_knowledge_base.md    # Spicy Agent knowledge content
├── classic_agent_instructions.md    # Classic Agent setup guide
├── classic_agent_knowledge_base.md  # Classic Agent knowledge content
├── MEMELORD_WARS_PROJECT_NOTES.md  # Complete project documentation
└── README.md              # This file
```

## Contributing

This project was built as a demo for DigitalOcean's GradientAI Platform. Feel free to fork and modify for your own demonstrations or learning purposes.

## License

This project is for demonstration purposes. Please respect the terms of service for all APIs and services used.

---

*Built with ❤️ for the AI developer community*