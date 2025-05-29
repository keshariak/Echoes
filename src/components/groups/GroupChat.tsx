import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, X, Reply, Loader2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { databases, DB_ID, COLLECTION_GROUP_MSG_ID, Query } from '../../configs/appwriteCongig';

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
    if (!newMessage.trim() || !groupId) return;

    try {
      const messageToSend: any = {
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
    }
  };

  const cancelReply = () => setReplyingTo(null);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 p-4 border-b border-gray-200 dark:border-dark-100 flex items-center">
        <button
          onClick={() => navigate('/groups')}
          className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-dark-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
          {groupName}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1  overflow-y-auto p-4 space-y-4 dark:bg-dark-300 scrollbar-thin scrollbar-thumb-primary-400 scrollbar-track-gray-200 dark:scrollbar-thumb-primary-600 dark:scrollbar-track-dark-300">
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="animate-spin w-6 h-6 text-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === senderId;
            return (
              <div key={message.$id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[75%] rounded-xl p-4 relative
                    ${isMine
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 shadow-sm'}
                  `}
                >
                  {message.replyTo && (
                    <div
                      className={`
                        mb-3 p-3 rounded-lg border-l-4 
                        ${isMine
                          ? 'border-primary-400 bg-primary-400 bg-opacity-40 text-white'
                          : 'border-primary-600 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300'}
                      `}
                      title={`Reply to: ${message.replyTo.text}`}
                    >
                      <p className="text-xs font-semibold truncate">
                        Replying to:{' '}
                        <span className="text-primary-300">
                          {message.replyTo.senderId === senderId ? 'yourself' : 'anonymous'}
                        </span>
                      </p>
                      <p className="text-sm truncate italic">{message.replyTo.text}</p>
                    </div>
                  )}
                  <p className="break-words whitespace-pre-wrap">{message.text}</p>
                  <div className='flex  w-full justify-between gap-3 '>
                    <time
                    dateTime={new Date(message.timestamp).toISOString()}
                    className="text-xs opacity-60 mt-2 block text-right select-none"
                    title={new Date(message.timestamp).toLocaleString()}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {/* <br /> */}
                  <button
                    onClick={() => setReplyingTo(message)}
                    className="  bottom-2 right-2 p-1 rounded-full hover:bg-primary-700 hover:text-white transition-colors"
                  >
                    <Reply className="w-4 h-4 opacity-70 hover:opacity-100" />
                  </button>

                  </div>
                  
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Bar */}
      {replyingTo && (
        <div className="bg-gray-100 dark:bg-dark-100 border-t border-gray-300 dark:border-dark-200 p-3 flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Replying to{' '}
              <strong>{replyingTo.senderId === senderId ? 'yourself' : 'anonymous'}</strong>
            </p>
            <p
              className="text-sm truncate italic text-gray-800 dark:text-gray-200"
              title={replyingTo.text}
            >
              {replyingTo.text}
            </p>
          </div>
          <button
            onClick={cancelReply}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 pt-1 dark:bg-dark-300  flex space-x-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={replyingTo ? 'Type your reply...' : 'Type a message...'}
          className="flex-grow rounded-full border border-gray-300 dark:border-dark-200 bg-gray-50 dark:bg-dark-100 px-4 py-2 focus:outline-none  text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          autoComplete="off"
          required
          
          
        />
        <button
          type="submit"
          className="rounded-full bg-primary-600 p-3 flex items-center justify-center hover:bg-primary-700 transition-colors text-white"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
