import React from 'react';
import AppImage from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ChatInterface = ({ messages, activeConversation, isTyping, messagesEndRef, currentUserId }) => {
  const formatMessageTime = (maybeDate) => {
    if (!maybeDate) return '';
    let date;
    if (typeof maybeDate === 'string' || typeof maybeDate === 'number') {
      date = new Date(maybeDate);
    } else if (maybeDate instanceof Date) {
      date = maybeDate;
    } else {
      // try to parse nested timestamp fields
      date = new Date(maybeDate?.$date ?? maybeDate?.timestamp ?? NaN);
    }

    if (isNaN(date?.getTime?.())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Icon name="Clock" size={12} className="text-muted-foreground" />;
      case 'delivered':
        return <Icon name="Check" size={12} className="text-muted-foreground" />;
      case 'read':
        return <Icon name="CheckCheck" size={12} className="text-primary" />;
      default:
        return null;
    }
  };

  const MessageBubble = ({ message }) => {
    // support both senderId and sender_id from different backends
    const sender = message?.senderId ?? message?.sender_id ?? message?.sender;
    const isMyMessage = sender && currentUserId ? String(sender) === String(currentUserId) : sender === 'me';

    return (
      <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
          {!isMyMessage && (
            <AppImage
              src={activeConversation?.participantAvatar}
              alt={activeConversation?.participantName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          )}
          
          <div className="flex flex-col space-y-1">
            {/* Message Content */}
            <div
              className={`px-4 py-3 rounded-lg ${
                isMyMessage
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              {message?.type === 'text' ? (
                <p className="text-sm break-words">{message?.content}</p>
              ) : message?.type === 'image' ? (
                <AppImage
                  src={message?.content}
                  alt="Shared image"
                  className="max-w-[200px] rounded-lg"
                />
              ) : (
                <p className="text-sm italic">Unsupported message type</p>
              )}
            </div>
            
            {/* Message Info */}
            <div className={`flex items-center space-x-1 text-xs text-muted-foreground ${
              isMyMessage ? 'justify-end' : 'justify-start'
            }`}>
              <span>{formatMessageTime(message?.timestamp)}</span>
              {isMyMessage && getMessageStatusIcon(message?.status)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2">
        <AppImage
          src={activeConversation?.participantAvatar}
          alt={activeConversation?.participantName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemMessage = ({ message }) => (
    <div className="flex justify-center mb-4">
      <div className="bg-muted/50 text-muted-foreground px-3 py-2 rounded-full text-xs">
        {message}
      </div>
    </div>
  );

  // Group messages by date, but only include messages that belong to the active conversation
  const groupMessagesByDate = (messages, activeConv) => {
    const groups = {};
    const convId = activeConv?.id || activeConv?._id || null;
    const filtered = (messages || []).filter(message => {
      if (!convId) return true; // no active conv specified, include all
      const mConv = message?.conversationId ?? message?.conversation_id ?? message?.conversation ?? message?.convId ?? null;
      return String(mConv) === String(convId);
    });

    filtered.forEach(message => {
      const date = new Date(message?.timestamp)?.toDateString();
      if (!groups?.[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages, activeConversation);
  const today = new Date()?.toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)?.toDateString();

  const formatDateHeader = (dateString) => {
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return new Date(dateString)?.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!messages || messages?.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AppImage
            src={activeConversation?.productImage}
            alt={activeConversation?.productTitle}
            className="w-16 h-16 rounded-lg mx-auto mb-4 object-cover"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {activeConversation?.productTitle}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Start your conversation about this product
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm hover:bg-primary/20 transition-smooth">
              Hi, is this still available?
            </button>
            <button className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm hover:bg-primary/20 transition-smooth">
              What's the condition?
            </button>
            <button className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm hover:bg-primary/20 transition-smooth">
              Can you tell me more?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {Object?.entries(messageGroups)?.map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Header */}
          <SystemMessage message={formatDateHeader(date)} />
          
          {/* Messages for this date */}
          {dateMessages?.map((message, index) => (
            <MessageBubble key={message?.id || index} message={message} />
          ))}
        </div>
      ))}
      
      {/* Product Context Card - Show at the beginning */}
      {messages?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <AppImage
              src={activeConversation?.productImage}
              alt={activeConversation?.productTitle}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">
                {activeConversation?.productTitle}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <Icon name="User" size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {activeConversation?.participantName}
                </span>
                <Icon 
                  name={activeConversation?.status === 'confirmed' ? 'CheckCircle' : 'Clock'} 
                  size={12} 
                  className={activeConversation?.status === 'confirmed' ? 'text-success' : 'text-warning'} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}
      
      {/* Messages End Reference */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface;