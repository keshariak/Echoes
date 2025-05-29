import React, { createContext, useContext, useEffect, useState } from "react";
import { databases, DB_ID, COLLECTION_GROUP_ID, Query, ID } from "../configs/appwriteCongig";

export interface Group {
  $id?: string;
  name: string;
  category: string;
  description: string;
  createdAt: string;        // ISO string for createdAt
  lastMessageTime: number;  // integer for lastMessageTime
}

interface GroupContextType {
  groups: Group[];
  loading: boolean;
  createGroup: (groupData: Omit<Group, '$id' | 'createdAt' | 'lastMessageTime'>) => Promise<void>;
  refreshGroups: () => Promise<void>;
  updateLastMessageTime: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Fetch groups and delete inactive ones
  const refreshGroups = async () => {
    setLoading(true);
    try {
      // Fetch all groups ordered by createdAt descending (createdAt is string but can still order by it lexicographically)
      const res = await databases.listDocuments(DB_ID, COLLECTION_GROUP_ID, [
        Query.orderDesc('createdAt'),
      ]);
      let fetchedGroups = res.documents as Group[];

      const now = Date.now();

      // Delete groups inactive for more than 24 hours
      for (const group of fetchedGroups) {
        if (now - group.lastMessageTime > INACTIVE_THRESHOLD) {
          if (group.$id) {
            await databases.deleteDocument(DB_ID, COLLECTION_GROUP_ID, group.$id);
          }
        }
      }

      // Refetch groups after cleanup
      const updatedRes = await databases.listDocuments(DB_ID, COLLECTION_GROUP_ID, [
        Query.orderDesc('createdAt'),
      ]);
      setGroups(updatedRes.documents as Group[]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  // Create a new group with timestamps
  const createGroup = async (groupData: Omit<Group, '$id' | 'createdAt' | 'lastMessageTime'>) => {
    try {
      const now = Date.now();
      const nowString = new Date(now).toISOString();

      const res = await databases.createDocument(
        DB_ID,
        COLLECTION_GROUP_ID,
        ID.unique(),
        {
          ...groupData,
          createdAt: nowString,    // string for createdAt
          lastMessageTime: now,    // integer for lastMessageTime
        }
      );

      setGroups(prev => [res as Group, ...prev]);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error; // let caller handle error if needed
    }
  };

  // Update lastMessageTime on new message
  const updateLastMessageTime = async (groupId: string) => {
    try {
      const now = Date.now();
      await databases.updateDocument(DB_ID, COLLECTION_GROUP_ID, groupId, {
        lastMessageTime: now,
      });
      setGroups(prev =>
        prev.map(g => (g.$id === groupId ? { ...g, lastMessageTime: now } : g))
      );
    } catch (error) {
      console.error('Error updating lastMessageTime:', error);
    }
  };

  return (
    <GroupContext.Provider
      value={{ groups, loading, createGroup, refreshGroups, updateLastMessageTime }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
