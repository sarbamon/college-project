'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { sendAssistantMessage } from '@/lib/api';

interface AIChatProps {
  analysisId?: string;
  initialExplanation?: string;
}

const SUGGESTED_QUESTIONS = [
  'Explain what my deep sleep (N3) percentage means for my physical recovery.',
  'Why did I wake up at 04:30 AM according to the hypnogram?',
  'What sleep hygiene interventions should I adopt before my next session?',
  'How does EEG Stage N2 spindle activity contribute to learning and memory?',
];

export const AIChat: React.FC<AIChatProps> = ({
  analysisId = 'psg-rec-8821',
  initialExplanation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: initialExplanation
        ? `Hello! I have reviewed your EEG sleep analysis recording (${analysisId}).\n\n**Polysomnography Overview:**\n${initialExplanation}\n\nYou can ask me any questions about your sleep architecture, sleep stage transitions, or personalised sleep hygiene recommendations.`
        : `Hello! I am your EEG Sleep AI Assistant. I can explain your sleep architecture, break down your hypnogram epochs, and discuss strategies to optimise your deep and REM sleep stages. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setError(null);
    setLoading(true);

    try {
      // Connect to FastAPI endpoint: POST http://localhost:8000/assistant/chat
      const response = await sendAssistantMessage(analysisId, userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(
        err.message ||
          'Unable to reach the Gemini LLM service via FastAPI (http://localhost:8000). Ensure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Gemini Clinical Sleep Explainer
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                Session: {analysisId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive question answering on polysomnography results & next-sleep plan
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'reset-1',
                role: 'assistant',
                content:
                  'Conversation refreshed. Feel free to ask any specific question regarding your EEG epoch analysis.',
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ]);
            setError(null);
          }}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-brand-primary text-white'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-primary text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-tl-xs px-4 py-3 text-xs border border-slate-200/60 flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Analysing EEG hypnogram with Gemini LLM...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Backend Communication Error</p>
              <p className="mt-0.5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested prompts carousel/chips */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center space-x-1.5 mb-1.5 text-[11px] font-medium text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
          <span>Quick Inquiries:</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 px-3 py-1 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this EEG sleep analysis..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-brand-primary hover:bg-blue-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

