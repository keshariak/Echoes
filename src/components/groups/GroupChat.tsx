import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, X, Reply, Loader2, Users, Smile } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { databases, DB_ID, COLLECTION_GROUP_MSG_ID, Query } from '../../configs/appwriteCongig';

const EMOJI_OPTIONS = [
  { key: 'like', emoji: '👍' },
  { key: 'heart', emoji: '❤️' },
  { key: 'laugh', emoji: '😂' },
  { key: 'wow', emoji: '😮' },
  { key: 'sad', emoji: '😢' },
];

interface Message {
  $id: string;
  groupId: string;
  text: string;
  senderId: string;
  timestamp: string;
  replyToId?: string | null;
  replyTo?: {
    $id: string;
    text: string;
    senderId: string;
  };
  reactions?: {
    [key: string]: {
      [userId: string]: boolean;
    };
  };
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return {
      iso: undefined,
      title: 'Invalid date',
      display: 'Invalid time',
    };
  }
  return {
    iso: date.toISOString(),
    title: date.toLocaleString(),
    display: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

const GroupChat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const groupName = location.state?.groupName || 'Group Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [senderId] = useState<string>(() => {
    let storedId = localStorage.getItem('senderId');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('senderId', storedId);
    }
    return storedId;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await databases.listDocuments(DB_ID, COLLECTION_GROUP_MSG_ID, [
          Query.equal('groupId', groupId),
          Query.orderAsc('timestamp'),
        ]);
        const docs = res.documents as Message[];

        const replyIds = docs.filter(d => d.replyToId).map(d => d.replyToId!) || [];
        let replyMessagesMap: Record<string, Message> = {};

        if (replyIds.length > 0) {
          const replyDocs = await databases.listDocuments(DB_ID, COLLECTION_GROUP_MSG_ID, [
            Query.equal('$id', replyIds),
          ]);
          replyMessagesMap = replyDocs.documents.reduce((acc, doc) => {
            acc[doc.$id] = doc as Message;
            return acc;
          }, {} as Record<string, Message>);
        }

        const messagesWithReplies = docs.map((msg) => ({
  ...msg,
  reactions: msg.reactions ? JSON.parse(msg.reactions as any) : {},
  replyTo: msg.replyToId ? replyMessagesMap[msg.replyToId] : undefined,
}));

        setMessages(messagesWithReplies);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId || isSending) return;

    setIsSending(true);
    try {
      const messageToSend = {
        groupId,
        text: newMessage.trim(),
        senderId,
        timestamp: new Date().toISOString(),
        replyToId: replyingTo ? replyingTo.$id : null,
      };

      const res = await databases.createDocument(
        DB_ID,
        COLLECTION_GROUP_MSG_ID,
        'unique()',
        messageToSend
      );

      let fullMessage: Message = res as Message;

      if (messageToSend.replyToId) {
        const replyDoc = await databases.getDocument(
          DB_ID,
          COLLECTION_GROUP_MSG_ID,
          messageToSend.replyToId
        );

        fullMessage = {
          ...fullMessage,
          replyTo: {
            $id: replyDoc.$id,
            text: replyDoc.text,
            senderId: replyDoc.senderId,
          },
        };
      }

      setMessages((prev) => [...prev, fullMessage]);
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const cancelReply = () => setReplyingTo(null);
const handleReaction = async (messageId: string, reactionKey: string) => {
  const message = messages.find(m => m.$id === messageId);
  if (!message) return;

  const currentReactions = typeof message.reactions === 'string'
    ? JSON.parse(message.reactions)
    : message.reactions || {};

  const updatedReactions: Message["reactions"] = {};

  // Remove all previous reactions by this user
  for (const key of Object.keys(currentReactions)) {
    updatedReactions[key] = { ...currentReactions[key] };
    if (updatedReactions[key][senderId]) {
      delete updatedReactions[key][senderId];
    }
  }

  // If user already reacted with the same emoji, just leave (toggle off)
  const alreadyReacted = currentReactions[reactionKey]?.[senderId];
  if (!alreadyReacted) {
    if (!updatedReactions[reactionKey]) updatedReactions[reactionKey] = {};
    updatedReactions[reactionKey][senderId] = true;
  }

  try {
    await databases.updateDocument(DB_ID, COLLECTION_GROUP_MSG_ID, messageId, {
      reactions: JSON.stringify(updatedReactions),
    });

    setMessages(prev =>
      prev.map(msg =>
        msg.$id === messageId ? { ...msg, reactions: updatedReactions } : msg
      )
    );
  } catch (err) {
    console.error('Failed to update reaction:', err);
  }

  setShowEmojiPicker(null);
};



  const getReactionCount = (message: Message, reactionKey: string) => {
    return Object.keys(message.reactions?.[reactionKey] || {}).length;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 p-2 border-b border-gray-200 dark:border-dark-100 flex items-center">
        <button onClick={() => navigate('/groups')} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <Users className="w-5 h-5 mr-3" />
        <h2 className="text-xl font-semibold truncate">{groupName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-dark-300">
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="animate-spin w-6 h-6 text-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map(message => {
            const isMine = message.senderId === senderId;
            const { iso, title, display } = formatTimestamp(message.timestamp);

            return (
              <div key={message.$id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[75%] p-4 rounded-xl ${isMine ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100'} shadow`}>
                  {message.replyTo && (
                    <div className={`mb-3 p-3 rounded-lg border-l-4 ${isMine ? 'border-primary-400 bg-primary-400/30' : 'border-primary-600 bg-primary-100 dark:bg-primary-900/20'}`}>
                      <p className="text-xs font-semibold">
                        Replying to <span>{message.replyTo.senderId === senderId ? 'yourself' : 'anonymous'}</span>
                      </p>
                      <p className="text-sm italic truncate">{message.replyTo.text}</p>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <div className="flex justify-between mt-2 items-center">
                    <time className="text-xs opacity-60" title={title}>{display}</time>

                    <div className='flex gap-3 ml-2'>
                      <button onClick={() => setReplyingTo(message)} className="hover:text-primary-600">
                      <Reply className="w-4 h-4" />
                    </button>

                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === message.$id ? null : message.$id)} 
                className="">
                  <Smile className="w-5 h-5" />
                </button>
                    </div>
                  </div>

                  {/* Reactions */}
                 <div className="flex gap-1 flex-wrap mt-2">
  {EMOJI_OPTIONS.filter(option => getReactionCount(message, option.key) > 0).map(option => {
    const count = getReactionCount(message, option.key);
    const reacted = message.reactions?.[option.key]?.[senderId];
    return (
      <button
        key={option.key}
        onClick={() => handleReaction(message.$id, option.key)}
        className={`px-2 py-1 text-sm rounded-full flex items-center gap-1 ${reacted ? 'bg-primary-400 dark:bg-primary-900/20' : 'bg-gray-200 dark:bg-dark-200'}`}
      >
        <span>{option.emoji}</span>
        <span>{count}</span>
      </button>
    );
  })}
</div>




                </div>

                

                {showEmojiPicker === message.$id && (
  <div
    className={`z-10 p-2 h-fit bg-white dark:bg-dark-200 border rounded-lg shadow-lg flex gap-2 flex-wrap w-max max-w-[90vw] top-full mt-2
      ${isMine ? 'right-20' : 'right-0'}`}
  >
    {EMOJI_OPTIONS.map(option => (
      <button
        key={option.key}
        onClick={() => handleReaction(message.$id, option.key)}
        className="text-xl hover:scale-110 transition-transform"
      >
        {option.emoji}
      </button>
    ))}
  </div>
)}



              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-3 bg-gray-100 dark:bg-dark-200 flex items-center justify-between border-t">
          <div>
            <p className="text-xs text-gray-500">Replying to {replyingTo.senderId === senderId ? 'yourself' : 'anonymous'}</p>
            <p className="text-sm italic truncate">{replyingTo.text}</p>
          </div>
          <button onClick={cancelReply}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 flex gap-3 bg-white dark:bg-dark-100 border-t">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={replyingTo ? 'Reply...' : 'Type a message...'}
          className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-dark-300 border outline-none"
        />
        <button type="submit" disabled={isSending} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
