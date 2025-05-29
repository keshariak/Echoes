import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databases, DB_ID, COLLECTION_GROUP_MSG_ID, Query, ID } from '../configs/appwriteCongig';

export interface Message {
  $id: string;
  groupId: string;
  text: string;
  senderId: string;
  timestamp: string;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
}

interface MessagesContextType {
  messages: Message[];
  loading: boolean;
  sendMessage: (text: string, senderId: string, replyTo?: Message | null) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ groupId: string; children: ReactNode }> = ({ groupId, children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch messages for the group
  const refreshMessages = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, COLLECTION_GROUP_MSG_ID, [
        Query.equal('groupId', groupId),
        Query.orderAsc('timestamp'),
      ]);
      setMessages(res.documents as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time message subscription
  useEffect(() => {
    if (!groupId) return;

    refreshMessages();

    const unsubscribe = databases.client.subscribe(
      `databases.${DB_ID}.collections.${COLLECTION_GROUP_MSG_ID}.documents`,
      (response) => {
        const payload = response.payload as Message;
        if (payload.groupId !== groupId) return;

        switch (response.event) {
          case 'database.documents.create':
            setMessages((prev) => [...prev, payload]);
            break;
          case 'database.documents.update':
            setMessages((prev) =>
              prev.map((msg) => (msg.$id === payload.$id ? payload : msg))
            );
            break;
          case 'database.documents.delete':
            setMessages((prev) => prev.filter((msg) => msg.$id !== payload.$id));
            break;
        }
      }
    );

    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [groupId]);

  // Send new message
  const sendMessage = async (text: string, senderId: string, replyTo?: Message | null) => {
    if (!groupId) throw new Error('No groupId');

    try {
      const now = Date.now().toString(); // Schema expects timestamp as string

      await databases.createDocument(
        DB_ID,
        COLLECTION_GROUP_MSG_ID,
        ID.unique(),
        {
          groupId,
          text,
          senderId,
          timestamp: now,
          ...(replyTo && {
            replyToId: replyTo.$id,
            replyToText: replyTo.text,
            replyToSender: replyTo.senderId,
          }),
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return (
    <MessagesContext.Provider value={{ messages, loading, sendMessage, refreshMessages }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
