import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MessageComposer = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const fileInputRef = useRef(null);

  const quickResponses = [
    "Hi, is this still available?",
    "What\'s the condition?",
    "Can you tell me more?",
    "When will you be back?",
    "What\'s your best price?",
    "Thank you!",
    "Sounds good to me",
    "I\'ll take it!"
  ];

  const emojis = ['😊', '👍', '❤️', '😍', '🙌', '🔥', '✨', '🎉', '🤝', '👏', '🙏', '💯'];

  const handleSend = (e) => {
    if (e) e.preventDefault(); // Prevent form submission
    if (message?.trim()) {
      onSendMessage?.(message?.trim());
      setMessage('');
      setShowQuickResponses(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSend();
    }
  };

  const handleQuickResponse = (response) => {
    setMessage(response);
    setShowQuickResponses(false);
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = () => {
    fileInputRef?.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // In a real app, you would upload the file and get a URL
      const fileUrl = URL?.createObjectURL(file);
      onSendMessage?.(fileUrl, file?.type?.startsWith('image/') ? 'image' : 'file');
    }
  };

  return (
    <div className="border-t border-border bg-card">
      {/* Quick Responses */}
      {showQuickResponses && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Quick Responses</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickResponses(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickResponses?.map((response, index) => (
              <button
                key={index}
                onClick={() => handleQuickResponse(response)}
                className="text-left text-sm p-2 rounded-lg border border-border hover:bg-muted transition-smooth"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Emojis</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {emojis?.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl p-2 rounded-lg hover:bg-muted transition-smooth text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Message Input Area */}
      <div className="p-4">
        {/* Main composer */}
        <form onSubmit={handleSend} className="flex items-start p-4 space-x-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 w-full p-2 text-sm bg-transparent border rounded-lg resize-none border-border focus:ring-2 focus:ring-primary focus:outline-none"
            rows={2}
          />
          <div className="flex items-center space-x-2">
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              className="text-muted-foreground"
              aria-label="Attach file"
            >
              <Icon name="Paperclip" size={20} />
            </Button>
            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground"
              aria-label="Add emoji"
            >
              <Icon name="Smile" size={20} />
            </Button>
            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>

        {/* Character count (optional) */}
        {message?.length > 200 && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${message?.length > 500 ? 'text-error' : 'text-muted-foreground'}`}>
              {message?.length}/500
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComposer;