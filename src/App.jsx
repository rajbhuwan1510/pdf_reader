import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi there! I am your personal document assistant. Click the (+) button to upload a PDF, and we can start exploring it together.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [indexing, setIndexing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setIndexing(true);
    setFile(selectedFile);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: 'bot', content: `I've finished processing "${selectedFile.name}". What's sparking your interest in this document?` }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Something went wrong: ' + data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'I can\'t seem to reach the knowledge base right now.' }]);
    } finally {
      setIndexing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'I had trouble generating that response. Could you try again?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-20 pb-40 flex flex-col no-scrollbar"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-entrance`}>
            {msg.role === 'bot' && (
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 ml-5">Assistant</div>
            )}
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start animate-entrance">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 ml-5">Assistant</div>
            <div className="chat-bubble bot italic opacity-50">Drafting response...</div>
          </div>
        )}
      </main>

      {/* Bottom Floating Dock */}
      <div className="input-dock-wrapper">
        <div className="max-w-xl mx-auto relative px-6">
          {/* File Status Indicator - FIXED to screen for safety */}
          {file && (
            <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl px-6 py-2.5 rounded-2xl text-[11px] font-bold text-slate-700 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex items-center gap-3 animate-entrance z-[9999]">
              <div className={`w-2.5 h-2.5 rounded-full ${indexing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
              {indexing ? 'Indexing...' : file.name}
            </div>
          )}

          <div className="floating-dock">
            <label className="action-btn cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
            </label>
            
            <input 
              type="text"
              placeholder={indexing ? "Processing document..." : "Share with Dot..."}
              className="flex-1 bg-transparent border-none outline-none text-slate-800 font-medium px-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={indexing}
            />
            
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim() || indexing}
              className={`action-btn ${input.trim() && !indexing ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
