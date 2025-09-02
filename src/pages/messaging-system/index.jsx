import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ConversationList from './components/ConversationList';
import ChatInterface from './components/ChatInterface';
import MessageComposer from './components/MessageComposer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const MessagingSystem = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load real conversations from server on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/messages/conversations');
        if (!mounted) return;
        // role-based filtering: rely on server but apply an extra client safeguard
        const role = (typeof window !== 'undefined' && localStorage.getItem('userRole')) || null;
        let convs = res.data || [];
        if (role === 'traveler') {
          convs = (convs || []).filter(c => !!c.product);
        }
        // If server returned no conversations, keep the previous list to avoid flicker
        if (convs && convs.length > 0) {
          setConversations(convs);
          console.debug('[MessagingSystem] loaded conversations count=', convs.length, 'sample=', convs.slice(0,3));
          setActiveConversation(convs[0] || null);
        } else {
          console.debug('[MessagingSystem] server returned empty conversations, keeping existing list length=', (conversations || []).length);
          // if we have no existing conversations, ensure state is empty
          if (!conversations || conversations.length === 0) {
            setConversations([]);
            setActiveConversation(null);
          }
        }
      } catch (e) {
        console.error('[MessagingSystem] failed to load conversations', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Load messages for active conversation from server
  useEffect(() => {
    let mounted = true;
    const loadMessages = async () => {
      if (!activeConversation || !activeConversation?.id) {
        setMessages([]);
        return;
      }
      try {
        const res = await api.get(`/api/messages/conversations/${activeConversation.id}`);
        if (!mounted) return;
        // backend returns { conversationId, messages, page, pageSize, total }
        setMessages(res.data?.messages || []);
        // mark conversation as read on server
        try {
          await api.patch(`/api/messages/${activeConversation.id}/read`);
        } catch (e) {
          // non-fatal
        }
      } catch (e) {
        console.error('[MessagingSystem] failed to load messages for', activeConversation?.id, e);
        setMessages([]);
      }
    };
    loadMessages();
    return () => { mounted = false; };
  }, [activeConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    setShowMobileChat(true);
    // optimistic UI: mark as read locally
    setConversations(prev => prev?.map(conv => 
      conv?.id === conversation?.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const handleSendMessage = (content, type = 'text') => {
    const newMessage = {
      id: Date.now()?.toString(),
      senderId: 'me',
      content,
      timestamp: new Date(),
      type,
  status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);

    // Update conversation last message
    setConversations(prev => prev?.map(conv =>
      conv?.id === activeConversation?.id
        ? { ...conv, lastMessage: content, lastMessageTime: new Date() }
        : conv
    ));

    // Simulate message sent
    // send to server
    (async () => {
      try {
        const payload = { conversationId: activeConversation?.id, content, type };
        await api.post('/api/messages/send', payload);
        setMessages(prev => prev?.map(msg => msg?.id === newMessage?.id ? { ...msg, status: 'delivered' } : msg));
      } catch (e) {
        console.error('[MessagingSystem] send failed', e);
        setMessages(prev => prev?.map(msg => msg?.id === newMessage?.id ? { ...msg, status: 'failed' } : msg));
      }
    })();

    // keep demo typing behavior for small UX nicety
    if (type === 'text' && content?.toLowerCase()?.includes('hello')) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const response = {
            id: (Date.now() + 1)?.toString(),
            senderId: 'other',
            content: 'Hello! How can I help you today?',
            timestamp: new Date(),
            type: 'text',
            status: 'delivered'
          };
          setMessages(prev => [...prev, response]);
          setIsTyping(false);
        }, 2000);
      }, 1000);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const filteredConversations = conversations?.filter(conv =>
    conv?.participantName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    conv?.productTitle?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Messages - Valikoo</title>
        <meta name="description" content="Secure messaging between travelers and buyers on Valikoo marketplace" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation userRole="buyer" />
        
        <main className="pt-14 lg:pt-16 pb-20 lg:pb-8">
          {/* Desktop Layout */}
          <div className="hidden lg:block h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 py-6 h-full">
              <div className="grid grid-cols-3 gap-6 h-full">
                
                {/* Conversation List */}
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>
                    <div className="relative">
                      <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e?.target?.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <ConversationList
                    conversations={filteredConversations}
                    activeConversation={activeConversation}
                    onConversationSelect={handleConversationSelect}
                  />
                </div>

                {/* Chat Area */}
                <div className="col-span-2 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
                  {activeConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={activeConversation?.participantAvatar}
                              alt={activeConversation?.participantName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {activeConversation?.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
                            )}
                          </div>
                          <div>
                            <h2 className="font-semibold text-foreground">
                              {activeConversation?.participantName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {activeConversation?.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Icon name="Phone" size={18} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="Video" size={18} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="MoreVertical" size={18} />
                          </Button>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <ChatInterface
                        messages={messages}
                        activeConversation={activeConversation}
                        isTyping={isTyping}
                        messagesEndRef={messagesEndRef}
                      />

                      {/* Message Composer */}
                      <MessageComposer onSendMessage={handleSendMessage} />
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="MessageCircle" size={64} className="text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h2>
                        <p className="text-muted-foreground">Choose a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden h-[calc(100vh-3.5rem)]">
            {!showMobileChat ? (
              <div className="h-full bg-card">
                <div className="p-4 border-b border-border">
                  <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <ConversationList
                  conversations={filteredConversations}
                  activeConversation={activeConversation}
                  onConversationSelect={handleConversationSelect}
                />
              </div>
            ) : (
              <div className="h-full bg-card flex flex-col">
                {/* Mobile Chat Header */}
                <div className="p-4 border-b border-border flex items-center space-x-3">
                  <Button variant="ghost" size="icon" onClick={handleBackToList}>
                    <Icon name="ArrowLeft" size={20} />
                  </Button>
                  <div className="relative">
                    <img
                      src={activeConversation?.participantAvatar}
                      alt={activeConversation?.participantName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {activeConversation?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground text-sm">
                      {activeConversation?.participantName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icon name="MoreVertical" size={18} />
                  </Button>
                </div>

                {/* Mobile Chat Messages */}
                <ChatInterface
                  messages={messages}
                  activeConversation={activeConversation}
                  isTyping={isTyping}
                  messagesEndRef={messagesEndRef}
                />

                {/* Mobile Message Composer */}
                <MessageComposer onSendMessage={handleSendMessage} />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default MessagingSystem;