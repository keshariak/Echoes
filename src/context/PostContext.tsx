import React, { createContext, useContext, useEffect, useState } from 'react';
import { databases, DB_ID, COLLECTION_POST_ID, Query } from '../configs/appwriteCongig';

interface PostContextType {
  posts: Post[];
  trendingPosts: Post[];
  addPost: (content: string, category?: Category) => Promise<void>;
  addReaction: (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => Promise<void>;
  getPostsByCategory: (category: Category) => Post[];
}

export interface Post {
  $id?: string;
  content: string;
  timestamp: string | Date;
  reactions: {
    hearts: number;
    flames: number;
    frowns: number;
  };
  category?: Category;
  userReactions?: {
    hearts?: boolean;
    flames?: boolean;
    frowns?: boolean;
  };
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, COLLECTION_POST_ID, [
        Query.orderDesc('timestamp'),
      ]);

      const reactedPosts = JSON.parse(localStorage.getItem('reactedPosts') || '{}');

      const fetchedPosts = (response.documents as Post[]).map(post => {
        const userReactions = {
          hearts: !!reactedPosts[`${post.$id}_hearts`],
          flames: !!reactedPosts[`${post.$id}_flames`],
          frowns: !!reactedPosts[`${post.$id}_frowns`],
        };
        return { ...post, userReactions };
      });

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async (content: string, category?: Category) => {
    try {
      const newPost: Omit<Post, '$id'> = {
        content,
        timestamp: new Date().toISOString(),
        reactions: {
          hearts: 0,
          flames: 0,
          frowns: 0,
        },
        category,
      };

      const response = await databases.createDocument(DB_ID, COLLECTION_POST_ID, 'unique()', newPost);
      const userReactions = { hearts: false, flames: false, frowns: false };
      setPosts(prevPosts => [{ ...(response as Post), userReactions }, ...prevPosts]);
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const addReaction = async (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => {
    try {
      const reactedPosts = JSON.parse(localStorage.getItem('reactedPosts') || '{}');

      // Find currently reacted type on this post, if any
      const currentReaction = ['hearts', 'flames', 'frowns'].find(
        rt => reactedPosts[`${postId}_${rt}`]
      );

      const post = posts.find(p => p.$id === postId);
      if (!post) return;

      let updatedReactions = { ...post.reactions };

      if (currentReaction === reactionType) {
        // Toggle off the same reaction
        updatedReactions[reactionType] = post.reactions[reactionType] - 1;
        delete reactedPosts[`${postId}_${reactionType}`];
      } else {
        // Remove old reaction if any
        if (currentReaction) {
          updatedReactions[currentReaction] = post.reactions[currentReaction] - 1;
          delete reactedPosts[`${postId}_${currentReaction}`];
        }
        // Add new reaction
        updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
        reactedPosts[`${postId}_${reactionType}`] = true;
      }

      // Update database
      await databases.updateDocument(DB_ID, COLLECTION_POST_ID, postId, {
        reactions: updatedReactions,
      });

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.$id === postId
            ? {
                ...p,
                reactions: updatedReactions,
                userReactions: {
                  hearts: false,
                  flames: false,
                  frowns: false,
                  ...(currentReaction === reactionType
                    ? {} // toggled off, no reaction active
                    : { [reactionType]: true }),
                },
              }
            : p
        )
      );

      // Update localStorage
      localStorage.setItem('reactedPosts', JSON.stringify(reactedPosts));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const getPostsByCategory = (category: Category) => {
    return posts.filter(post => post.category === category);
  };

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const totalA = a.reactions.hearts + a.reactions.flames + a.reactions.frowns;
      const totalB = b.reactions.hearts + b.reactions.flames + b.reactions.frowns;
      return totalB - totalA;
    })
    .slice(0, 10);

  return (
    <PostContext.Provider value={{ posts, trendingPosts, addPost, addReaction, getPostsByCategory }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
