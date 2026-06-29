import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, Send, User, RotateCcw } from 'lucide-react';
import api from '../api/axios';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AiConsultantPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I am your AI Workspace Consultant. I have access to your CRM, projects, tasks, workflows, and invoices. Ask me anything, or instruct me to evaluate SLA breaches, draft proposals, or audit organization tasks.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [agentId, setAgentId] = useState('PM_AGENT');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                message: { role: 'user', content: input },
                agentId: agentId
            });

            if (res.data?.success) {
                const assistMessage: Message = {
                    role: 'assistant',
                    content: res.data.data.content,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistMessage]);
            }
        } catch (error) {
            console.error('AI chat failed', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error communicating with the agent. Please verify that the backend services are running properly.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: `Consultant initialized as: ${agentId === 'PM_AGENT' ? 'Project Manager Agent' : 'Business Architect Consultant'}. How can I assist you with your B2B workspace tasks today?`,
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto glass-card overflow-hidden border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-250 dark:border-slate-800 bg-slate-900/10 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-xl">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">AI Agent Consultant</h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Interactive ReAct Model Engine
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Agent selection */}
                    <select
                        value={agentId}
                        onChange={(e) => {
                            setAgentId(e.target.value);
                            resetChat();
                        }}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 text-slate-700 dark:text-slate-355 focus:outline-none"
                    >
                        <option value="PM_AGENT">PM Consultant</option>
                        <option value="BUSINESS_CONSULTANT">Business Architect</option>
                    </select>

                    <button 
                        onClick={resetChat}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-405 transition-colors"
                        title="Reset conversation"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={idx} className={`flex gap-4 ${isUser ? 'justify-end' : ''}`}>
                            {/* Avatar */}
                            {!isUser && (
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center self-start border border-indigo-500/10">
                                    <Bot size={16} />
                                </div>
                            )}

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                                isUser 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-850 rounded-tl-none text-slate-800 dark:text-slate-200'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <span className={`text-[8px] font-bold block mt-2 text-right ${isUser ? 'text-blue-200' : 'text-slate-450 dark:text-slate-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {isUser && (
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center self-start border border-blue-500/10">
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/10">
                            <Bot size={16} />
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1.5 py-3">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-250 dark:border-slate-800 bg-slate-900/10 dark:bg-white/5">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message the ${agentId === 'PM_AGENT' ? 'PM Consultant' : 'Business Architect'}...`}
                        className="input-field py-3 text-xs bg-white dark:bg-slate-950"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="btn-primary p-3 rounded-xl aspect-square shrink-0"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AiConsultantPage;
