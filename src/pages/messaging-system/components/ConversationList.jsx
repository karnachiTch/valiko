import React, { useEffect, useState } from 'react';
import AppImage from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import api from '../../../api';

const ConversationList = ({ conversations, activeConversation, onConversationSelect }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'pending':
        return { icon: 'Clock', color: 'text-warning' };
      case 'in_transit':
        return { icon: 'Plane', color: 'text-primary' };
      case 'delivered':
        return { icon: 'Package', color: 'text-accent' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  // helper to normalize id and common field names from different backend shapes
  const idOf = (v) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return String(v?.id ?? v?._id ?? v?.conversationId ?? v?.conversation_id ?? '');
  };

  const getField = (conv, ...keys) => {
    for (const k of keys) {
      if (conv?.[k] !== undefined && conv?.[k] !== null) return conv[k];
    }
    return undefined;
  };

  const formatTime = (date) => {
    try {
      if (!date) return '';
      // Normalize date input (accept Date, number, or string)
      const d = date instanceof Date ? date : (typeof date === 'number' ? new Date(date) : new Date(String(date)));
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return d.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  const [localConversations, setLocalConversations] = useState(conversations || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep local state in sync if parent passes conversations
  useEffect(() => {
    setLocalConversations(conversations || []);
  }, [conversations]);

  useEffect(() => {
    console.debug('[ConversationList] localConversations updated, length=', localConversations?.length);
  }, [localConversations]);

  // fetch conversations when not provided by parent
  useEffect(() => {
    let mounted = true;
    const fetchConversations = async () => {
      // if parent passes the `conversations` prop (even an empty array), do not fetch here
      if (typeof conversations !== 'undefined') return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/messages/conversations');
        if (!mounted) return;
        setLocalConversations(res.data || []);
      } catch (err) {
        console.error('[ConversationList] failed to load conversations', err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchConversations();
    return () => { mounted = false; };
  }, []); // run once on mount

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Loader" size={36} className="animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="AlertTriangle" size={36} className="text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load conversations</h3>
          <p className="text-muted-foreground text-sm">Please check your connection or try again later.</p>
        </div>
      </div>
    );
  }

  // display conversations as provided by parent or fetched from server
  const displayConversations = localConversations || [];

  if (!displayConversations || displayConversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No conversations</h3>
          <p className="text-muted-foreground text-sm">
            Start browsing products to connect with travelers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
  {displayConversations?.map((conversation) => {
        const statusInfo = getStatusIcon(getField(conversation, 'status', 'state'));
        const convId = idOf(getField(conversation, 'id', '_id', 'conversationId', 'conversation_id'));
        const activeId = idOf(getField(activeConversation, 'id', '_id', 'conversationId', 'conversation_id'));
        const isActive = activeId && convId && activeId === convId;

        const participantName = getField(conversation, 'participantName', 'participant_name', 'participant', 'userName', 'name') || '';
        const participantAvatar = getField(conversation, 'participantAvatar', 'participant_avatar', 'participantImage', 'participant') || conversation?.participantAvatar;
        const productTitle = getField(conversation, 'productTitle', 'product_title', 'title') || '';
        const productImage = getField(conversation, 'productImage', 'product_image', 'productImageUrl') || conversation?.productImage;
  // normalize lastMessage: backend may return object { content } or string
  const lastMessageRaw = getField(conversation, 'lastMessage', 'last_message', 'message', 'last_message_text');
  let lastMessage = '';
  if (typeof lastMessageRaw === 'string') lastMessage = lastMessageRaw;
  else if (lastMessageRaw && typeof lastMessageRaw === 'object') lastMessage = lastMessageRaw.content || lastMessageRaw.message || String(lastMessageRaw) || '';
  else lastMessage = '';
        const lastMessageTime = getField(conversation, 'lastMessageTime', 'last_message_time', 'updatedAt', 'createdAt');
        const unread = getField(conversation, 'unreadCount', 'unread_count', 'unread') || 0;

        return (
          <button
            key={convId || Math.random()}
            onClick={() => onConversationSelect?.(conversation)}
            className={`w-full p-4 border-b border-border hover:bg-muted transition-smooth text-left ${
              isActive ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Participant Avatar */}
              <div className="relative flex-shrink-0">
                <AppImage
                  src={participantAvatar}
                  alt={participantName}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
                {conversation?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {participantName}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {lastMessage || 'No messages yet'}
                </p>
              </div>
              {unread > 0 && (
                <span className="text-xs font-bold text-white bg-primary rounded-full px-2 py-1">
                  {unread}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;