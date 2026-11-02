import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Trash2,
  Plus,
  Bot,
  User,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  Clock,
  Sparkle,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  UserProfile,
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareRoutine,
  AssistantMessage,
  AssistantConversation,
} from '../types';
import {
  skinProfileService,
  analysisService,
  routineService,
  assistantStorageService,
} from '../lib/supabase';
import {
  generateAssistantResponse,
  SUGGESTED_QUESTIONS,
} from '../lib/skincareAssistantService';

interface AiCompanionPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const AiCompanionPage: React.FC<AiCompanionPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<SkinProfileData | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<SkinAnalysisRecord | null>(null);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);

  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadData() {
      const [pData, aList, rData, convList] = await Promise.all([
        skinProfileService.getProfile(currentUser.id),
        analysisService.getAnalyses(currentUser.id),
        routineService.getRoutine(currentUser.id),
        assistantStorageService.getConversations(currentUser.id),
      ]);

      setProfile(pData);
      if (aList.length > 0) setLatestAnalysis(aList[0]);
      setRoutine(rData);

      setConversations(convList);
      if (convList.length > 0) {
        setActiveConversationId(convList[0].id);
        const msgs = await assistantStorageService.getMessages(convList[0].id);
        setMessages(msgs);
      }
    }
    loadData();
  }, [currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setIsLoading(true);
    try {
      const msgs = await assistantStorageService.getMessages(convId);
      setMessages(msgs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    const newConv = await assistantStorageService.createConversation(currentUser.id);
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    const msgs = await assistantStorageService.getMessages(newConv.id);
    setMessages(msgs);
  };

  const handleClearConversation = async () => {
    if (!activeConversationId) return;
    await assistantStorageService.deleteConversation(currentUser.id, activeConversationId);
    const remaining = conversations.filter((c) => c.id !== activeConversationId);
    setConversations(remaining);

    if (remaining.length > 0) {
      setActiveConversationId(remaining[0].id);
      const msgs = await assistantStorageService.getMessages(remaining[0].id);
      setMessages(msgs);
    } else {
      await handleNewConversation();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setInputValue('');
    setErrorMessage(null);

    const userMessage: AssistantMessage = {
      id: `msg_user_${Date.now()}`,
      conversationId: activeConversationId,
      userId: currentUser.id,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await assistantStorageService.saveMessage(userMessage);

      // Generate personalized grounded response
      const assistantResult = await generateAssistantResponse(query, messages, {
        profile,
        latestAnalysis,
        routine,
      });

      const assistantMessage: AssistantMessage = {
        id: `msg_asst_${Date.now()}`,
        conversationId: activeConversationId,
        userId: 'skinovate_ai',
        role: 'assistant',
        content: assistantResult.content,
        referencedActives: assistantResult.referencedActives,
        referencedMetrics: assistantResult.referencedMetrics,
        createdAt: new Date().toISOString(),
      };

      await assistantStorageService.saveMessage(assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setErrorMessage('Unable to process response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="companion-page-viewport">
      <div className="companion-container">
        {/* Top Header */}
        <div className="companion-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-new-chat-top"
              onClick={handleNewConversation}
              title="Start a new skincare consultation"
            >
              <Plus size={15} />
              <span>New Conversation</span>
            </button>

            <button
              type="button"
              className="btn-clear-chat-top"
              onClick={handleClearConversation}
              title="Clear current conversation"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="companion-header-block">
          <div className="page-badge">
            <Sparkles size={14} />
            <span>Phase 4: AI Skincare Intelligence</span>
          </div>
          <h1 className="companion-title">Meet Your Personal Skincare Companion</h1>
          <p className="companion-subtitle">
            Ask questions, explore skincare ingredients and get guidance based on your personal skincare profile.
          </p>

          {/* Connected Skin Profile Context Pill */}
          <div className="companion-context-pill">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>
              Personalized with: <strong>{profile?.skinType || 'Combination'}</strong> Skin &bull;{' '}
              {latestAnalysis ? (
                <>Barrier Index: <strong>{latestAnalysis.metrics.barrierHealth?.score}/100</strong> &bull; </>
              ) : null}
              Goal: <strong>{profile?.primaryGoal || 'Barrier Health'}</strong>
            </span>
          </div>
        </div>

        {/* Safety & Educational Boundaries Banner */}
        <div className="companion-safety-advisory">
          <ShieldAlert size={16} className="text-royal-violet flex-shrink-0" />
          <p>
            Skinovate AI is an educational cosmetic skincare companion, not a medical professional. It does not diagnose dermatological medical diseases, evaluate biopsies, or prescribe medications. Consult a board-certified dermatologist for medical skin conditions.
          </p>
        </div>

        {/* Chat Stage Layout */}
        <div className="companion-chat-stage">
          {/* Main Chat Panel */}
          <div className="chat-messages-container">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`chat-bubble-wrap ${
                  msg.role === 'user' ? 'chat-bubble-wrap--user' : 'chat-bubble-wrap--assistant'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="chat-avatar">
                  {msg.role === 'user' ? (
                    <User size={16} className="text-charcoal" />
                  ) : (
                    <Bot size={17} className="text-royal-violet" />
                  )}
                </div>

                <div className="chat-bubble-content">
                  <div className="bubble-sender-row">
                    <span className="sender-name">
                      {msg.role === 'user' ? currentUser.fullName : 'Skinovate Companion'}
                    </span>
                    <span className="msg-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="msg-text-markdown">
                    {msg.content.split('\n\n').map((para, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>

                  {msg.referencedActives && msg.referencedActives.length > 0 && (
                    <div className="referenced-actives-row">
                      <span className="ref-label">Referenced Formulations:</span>
                      {msg.referencedActives.map((act) => (
                        <span key={act} className="ref-pill">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                className="chat-bubble-wrap chat-bubble-wrap--assistant"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="chat-avatar">
                  <Bot size={17} className="text-royal-violet" />
                </div>
                <div className="chat-bubble-content loading-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="loading-caption">Calibrating response with your skin profile...</span>
                </div>
              </motion.div>
            )}

            {errorMessage && (
              <div className="chat-error-banner">
                <Info size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Horizontal Bar */}
          <div className="suggested-questions-row">
            <span className="suggested-label">Suggested:</span>
            <div className="suggested-scroll-track">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="btn-suggested-chip"
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                >
                  <Sparkle size={11} className="text-royal-violet" />
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chat-input-form"
          >
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask about active ingredients, routine timing, or your scan results..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn-chat-send"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
