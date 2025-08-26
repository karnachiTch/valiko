import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  // store messages per conversation to avoid leaking messages between conversations
  const [messagesByConv, setMessagesByConv] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const wsRef = useRef(null);
  const location = useLocation();

  // helper to normalize ids for comparisons (accepts objects or primitive ids)
  const idOf = (v) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return String(v?.id ?? v?._id ?? v?.conversationId ?? v?.conversation_id ?? v?.convId ?? '');
  };
  // Toggle automatic polling for conversations/messages
  const POLLING_ENABLED = false;

  // Fetch conversations from API (no mock fallback)
  useEffect(() => {
    let mounted = true;

    const fetchConversations = async () => {
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        const res = await api.get('/api/messages/conversations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!mounted) return;
        const data = res.data || [];
        setConversations(data);

        // If navigation passed an activeConversationId (from product detail), activate that conversation
        const targetId = location?.state?.activeConversationId;
        if (targetId) {
          const found = data.find(c => String(c?.id || c?._id) === String(targetId));
          if (found) {
            setActiveConversation(found);
          } else {
            // try fetching the single conversation by id and prepend it
            try {
              const singleRes = await api.get(`/api/messages/conversations/${targetId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              const convData = singleRes?.data?.conversation ?? singleRes?.data ?? singleRes?.data?.messages ? { id: targetId, messages: singleRes.data } : singleRes.data;
              if (convData) {
                // ensure conversations list updated
                setConversations(prev => [convData, ...(prev || [])]);
                setActiveConversation(convData);
              } else {
                setActiveConversation(data?.[0] ?? null);
              }
            } catch (e) {
              console.warn('Could not fetch target conversation', targetId, e);
              setActiveConversation(data?.[0] ?? null);
            }
          }
        } else if (data.length === 0) {
          setActiveConversation(null);
        } else {
          setActiveConversation(data[0]);
        }
      } catch (err) {
  // API failed — keep conversations empty and log error
  console.error('Failed to fetch conversations:', err);
  if (!mounted) return;
  setConversations([]);
  setActiveConversation(null);
  alert('Failed to fetch conversations. Please try again later.');
      }
    };

    fetchConversations();

    return () => { mounted = false; };
  }, []);

  // Fetch current authenticated user on mount
  useEffect(() => {
    let mounted = true;
    const fetchCurrentUser = async () => {
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        const res = await api.get('/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!mounted) return;
        setCurrentUser(res.data);
      } catch (err) {
        if (!mounted) return;
        setCurrentUser(null);
        alert('Failed to fetch user data. Please try again later.');
      }
    };
    fetchCurrentUser();

    return () => { mounted = false; };
  }, []);

  // WebSocket real-time updates (new messages, read receipts)
  useEffect(() => {
    // allow overriding WS URL via localStorage for testing
    const buildWsUrl = () => {
      const override = localStorage.getItem('WS_URL');
      if (override) return override;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws`;
    };

    const wsUrl = buildWsUrl();
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.info('Messaging WS connected', wsUrl);
        // optionally authenticate over WS if server requires token
        const token = localStorage.getItem('accessToken');
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }));
        }
      };

      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          const type = payload?.type;
          if (type === 'product_update') {
            // add to notifications list and increment unread; payload: { action, product }
            const note = {
              id: payload?.product?.id ? `prod-${payload.product.id}-${Date.now()}` : `prod-${Date.now()}`,
              action: payload?.action || 'updated',
              product: payload?.product || {},
              timestamp: new Date().toISOString()
            };
            setNotifications(prev => [note, ...(prev || [])]);
            return;
          }
          if (type === 'new_message') {
            const msg = payload?.message;
            const convId = payload?.conversationId ?? msg?.conversationId ?? msg?.conversation_id;
            // update conversations list
              setConversations(prev => prev?.map(conv => idOf(conv?.id) === idOf(convId) ? { ...conv, lastMessage: msg?.content ?? msg?.text, lastMessageTime: msg?.timestamp ?? new Date() , unreadCount: (conv?.unreadCount || 0) + (String(msg?.senderId ?? msg?.sender ?? '') === String(currentUser?.id || currentUser?._id || currentUser?.user_id) ? 0 : 1) } : conv));

            // if message is for currently open conversation append it
            if (convId && activeConversation?.id === convId) {
              setMessages(prev => [...(prev || []), msg]);
              // ensure UI marks it read locally
              setConversations(prev => prev?.map(conv => conv?.id === convId ? { ...conv, unreadCount: 0 } : conv));
              // send read receipt back
              try {
                ws.send(JSON.stringify({ type: 'read_receipt', conversationId: convId, messageId: msg?.id }));
              } catch (e) { /* ignore */ }
            }
          } else if (type === 'read_receipt') {
            const convIdRaw = payload?.conversationId;
            const messageId = payload?.messageId;
            const convId = idOf(convIdRaw);

            // mark messages in the per-conversation cache as read
            setMessagesByConv(prev => {
              if (!prev) return prev;
              const existing = Array.isArray(prev?.[convIdRaw]) ? prev[convIdRaw] : prev?.[convId] || [];
              const updated = (existing || []).map(m => {
                if (payload?.all) return { ...m, status: 'read' };
                if (m?.id === messageId) return { ...m, status: 'read' };
                return m;
              });
              return { ...(prev || {}), [convIdRaw]: updated, [convId]: updated };
            });

            // if active conversation matches, update visible messages too
            if (activeConversation && idOf(activeConversation?.id) === convId) {
              setMessages(prev => (prev || []).map(m => {
                if (payload?.all) return { ...m, status: 'read' };
                if (m?.id === messageId) return { ...m, status: 'read' };
                return m;
              }));
            }

            // update conversations list unread counts robustly
            setConversations(prev => prev?.map(conv => {
              if (!conv) return conv;
              const convNormalizedId = idOf(conv?.id);
              if (!convNormalizedId) return conv;
              if (convNormalizedId !== convId) return conv;
              if (payload?.all) return { ...conv, unreadCount: 0 };
              const newCount = Math.max(0, (conv?.unreadCount || 0) - 1);
              return { ...conv, unreadCount: newCount };
            }));
          }
        } catch (err) {
          console.warn('Invalid WS message', err, ev.data);
        }
      };

      ws.onclose = () => {
        console.warn('Messaging WS disconnected');
        setTimeout(() => {
          console.info('Reconnecting WebSocket...');
          const newWs = new WebSocket(wsUrl);
          wsRef.current = newWs;
        }, 5000); // Retry after 5 seconds
      };
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      console.log('WebSocket URL:', wsUrl);
    } catch (err) {
      console.warn('Failed to initialize WebSocket', err);
    }

    return () => {
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    };
  }, [activeConversation, currentUser]);

  // Fetch messages for active conversation with fallback
  useEffect(() => {
    let mounted = true;

  const fetchMessages = async (conversation) => {
      if (!conversation) return;
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        const res = await api.get(`/api/messages/conversations/${conversation.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!mounted) return;
  const msgs = res.data.messages ?? res.data ?? [];
  // store messages under conversation id
  const convId = conversation?.id;
  setMessagesByConv(prev => ({ ...(prev || {}), [convId]: msgs }));
  setMessages(msgs);
        // compute unread count for this conversation
        try {
          const currentId = currentUser?.id || currentUser?._id || currentUser?.user_id || null;
          const unread = (msgs || []).filter(m => {
            const sender = m?.senderId ?? m?.sender_id ?? m?.sender;
            const status = m?.status ?? (m?.read ? 'read' : undefined);
            return String(sender) !== String(currentId) && status !== 'read';
          }).length;
          setConversations(prev => prev?.map(conv => conv?.id === conversation.id ? { ...conv, unreadCount: unread } : conv));
        } catch (e) {
          // ignore compute errors
        }
      } catch (err) {
  // failed to fetch messages — clear messages for this conversation and log
  console.error('Failed to fetch messages for conversation', conversation?.id, err);
  if (!mounted) return;
  setMessagesByConv(prev => ({ ...(prev || {}), [conversation?.id]: [] }));
  setMessages([]);
  setConversations(prev => prev?.map(conv => conv?.id === conversation.id ? { ...conv, unreadCount: 0 } : conv));
      }
    };

  fetchMessages(activeConversation);

    return () => { mounted = false; };
  }, [activeConversation]);

  // Polling for new messages & conversation updates
  useEffect(() => {
    // clear previous interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const startPolling = () => {
      if (!POLLING_ENABLED) return; // polling disabled
      pollingRef.current = setInterval(async () => {
        try {
          const api = await import('../../api').then(m => m.default);
          const token = localStorage.getItem('accessToken');
          // refresh conversations
          const convRes = await api.get('/api/messages/conversations', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (convRes?.data) setConversations(convRes.data);

          // refresh active conversation messages
          if (activeConversation) {
            const msgRes = await api.get(`/api/messages/conversations/${activeConversation.id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (msgRes?.data) setMessages(msgRes.data.messages ?? msgRes.data ?? []);
          }
        } catch (err) {
          // ignore polling errors (keep mock data)
        }
      }, 5000);
    };

    startPolling();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [activeConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const convId = activeConversation?.id;
    const currentMessages = messagesByConv[convId] || [];
    // scroll when the active conversation's messages change
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByConv, activeConversation]);

  const handleConversationSelect = (conversation) => {
  setActiveConversation(conversation);
  // clear messages immediately in UI for this conversation until loaded
  setMessagesByConv(prev => ({ ...(prev || {}), [conversation?.id]: [] }));
  setMessages([]);
    setShowMobileChat(true);
    // Mark as read (clear unread count locally)
    setConversations(prev => prev?.map(conv => 
      conv?.id === conversation?.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
    // Attempt to mark messages as read on server
    (async () => {
      try {
        const api = await import('../../api').then(m => m.default);
        const token = localStorage.getItem('accessToken');
        await api.post(`/api/messages/conversations/${conversation?.id}/read`, {}, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } catch (err) {
        // ignore server failure - local UI already cleared
        console.warn('Failed to mark conversation read on server', err);
      }
    })();
    // Mark messages in local cache as read for this conversation
    try {
      const convId = conversation?.id;
      setMessagesByConv(prev => {
        const existing = Array.isArray(prev?.[convId]) ? prev[convId] : [];
        const updated = (existing || []).map(m => {
          const sender = m?.senderId ?? m?.sender ?? m?.sender_id;
          // mark as read if it's not sent by current user
          if (idOf(sender) !== idOf(currentUser?.id ?? currentUser?._id ?? currentUser?.user_id)) {
            return { ...m, status: 'read' };
          }
          return m;
        });
        return { ...(prev || {}), [convId]: updated };
      });
      // also update currently-viewed messages array if applicable
      setMessages(prev => (prev || []).map(m => {
        const sender = m?.senderId ?? m?.sender ?? m?.sender_id;
        if (idOf(sender) !== idOf(currentUser?.id ?? currentUser?._id ?? currentUser?.user_id)) {
          return { ...m, status: 'read' };
        }
        return m;
      }));
      // inform server/other clients via websocket read receipt if connected
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'read_receipt', conversationId: conversation?.id, all: true }));
        }
      } catch (e) { /* ignore ws send errors */ }
    } catch (e) {
      // ignore local mark failures
    }
    // fetch user only if not already fetched
    if (!currentUser && !user) {
      const fetchUser = async () => {
        try {
          const res = await import('../../api').then(m => m.default.get('/api/auth/me'));
          setUser(res.data);
          setCurrentUser(res.data);
        } catch (err) {
          setUser(null);
          alert('Failed to fetch user data. Please try again later.');
        }
      };
      fetchUser();
    }
  };

  // Recompute unread counts from messagesByConv whenever messages or currentUser change
  useEffect(() => {
    try {
      setConversations(prev => {
        if (!prev) return prev;
        const counts = {};
        for (const conv of prev) {
          const convId = conv?.id;
          const msgs = messagesByConv[convId] || [];
          const unread = (msgs || []).filter(m => {
            const sender = m?.senderId ?? m?.sender ?? m?.sender_id;
            const status = m?.status ?? (m?.read ? 'read' : undefined);
            return idOf(sender) !== idOf(currentUser?.id ?? currentUser?._id ?? currentUser?.user_id) && status !== 'read';
          }).length;
          counts[convId] = unread;
        }
        return prev.map(conv => ({ ...conv, unreadCount: counts[conv?.id] || 0 }));
      });
    } catch (e) {
      // ignore recompute errors
    }
  }, [messagesByConv, currentUser]);

  // Send message handler (optimistic UI + API)
  const handleSendMessage = async (content, type = 'text') => {
    if (!activeConversation) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      senderId: currentUser?.id || currentUser?._id || currentUser?.user_id || 'me',
      content,
      timestamp: new Date().toISOString(),
      type: type || 'text',
      status: 'sending',
      conversationId: activeConversation?.id
    };

    // optimistic update - append into messagesByConv for active conversation
    setMessagesByConv(prev => {
      const convId = activeConversation?.id;
      const existing = Array.isArray(prev?.[convId]) ? prev[convId] : [];
      return { ...(prev || {}), [convId]: [...existing, newMessage] };
    });
    setMessages(prev => [...(prev || []), newMessage]);

    try {
      const api = await import('../../api').then(m => m.default);
      const token = localStorage.getItem('accessToken');
      const res = await api.post('/api/messages/send', {
        conversationId: activeConversation.id,
        content,
        type
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

  // normalize saved message from server
      const savedRaw = res?.data;
      const savedMessage = savedRaw?.message ?? savedRaw?.data ?? savedRaw;

      const normalized = {
        id: savedMessage?.id ?? savedMessage?._id ?? tempId,
        senderId: savedMessage?.senderId ?? savedMessage?.sender_id ?? savedMessage?.sender ?? newMessage.senderId,
        content: savedMessage?.content ?? savedMessage?.text ?? content,
        timestamp: savedMessage?.timestamp ?? savedMessage?.createdAt ?? new Date().toISOString(),
        type: savedMessage?.type ?? savedMessage?.message_type ?? newMessage.type,
        status: savedMessage?.status ?? 'delivered'
      };

      // replace temp message with normalized message in messagesByConv for this conversation
      setMessagesByConv(prev => {
        const convId = activeConversation?.id;
        const existing = Array.isArray(prev?.[convId]) ? prev[convId] : [];
        return { ...(prev || {}), [convId]: existing.map(m => m?.id === tempId ? normalized : m) };
      });
      setMessages(prev => prev?.map(m => m?.id === tempId ? normalized : m));

      // update conversation lastMessage
      setConversations(prev => prev?.map(conv => {
        if (conv?.id !== activeConversation.id) return conv;
        // when current user sends, unreadCount for this user remains the same
        return { ...conv, lastMessage: content, lastMessageTime: new Date(), unreadCount: 0 };
      }));
    } catch (err) {
      // mark message as failed
      setMessages(prev => prev?.map(m => m?.id === tempId ? { ...m, status: 'failed' } : m));
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const filteredConversations = conversations?.filter(conv =>
    conv?.participantName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    conv?.productTitle?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  return (
    <>
      <Helmet>
        <title>Messages - Valikoo</title>
        <meta name="description" content="Secure messaging between travelers and buyers on Valikoo marketplace" />
      </Helmet>
      <div className="min-h-screen bg-background">
    <RoleBasedNavigation userRole="buyer" unreadMessages={((conversations || []).reduce((s, c) => s + (c?.unreadCount || 0), 0) + (notifications || []).length)} />
  <RoleBasedNavigation userRole="buyer" user={user} unreadMessages={((conversations || []).reduce((s, c) => s + (c?.unreadCount || 0), 0) + (notifications || []).length)} />
        
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
                          <div className="relative">
                            <Button variant="ghost" size="icon" onClick={() => setShowNotificationsPanel(s => !s)}>
                              <Icon name="Bell" size={18} />
                              {notifications?.length > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-destructive rounded-full">{notifications.length}</span>
                              )}
                            </Button>
                            {showNotificationsPanel && (
                              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-md shadow-lg z-50">
                                <div className="p-2">
                                  <h4 className="text-sm font-semibold mb-2">Notifications</h4>
                                  {notifications?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No notifications</p>
                                  ) : (
                                    <ul className="max-h-64 overflow-auto">
                                      {notifications.map(n => (
                                        <li key={n.id} className="p-2 border-b border-border text-sm">
                                          <div className="font-medium">{n.action} — {n.product?.title || n.product?.name || 'Product'}</div>
                                          <div className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
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
                        currentUserId={currentUser?.id || currentUser?._id || currentUser?.user_id}
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
                  currentUserId={currentUser?.id || currentUser?._id || currentUser?.user_id}
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