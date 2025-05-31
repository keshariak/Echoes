import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  databases,
  DB_ID,
  COLLECTION_POST_ID,
  COLLECTION_COMMENT_ID,
  Query,
  ID,
} from '../configs/appwriteCongig';

type ReactionType = 'hearts' | 'flames' | 'cry' | 'smile' | 'laugh' | 'neutral';

interface PostContextType {
  posts: Post[];
  trendingPosts: Post[];
  addPost: (content: string, category?: Category) => Promise<void>;
  addReaction: (postId: string, reactionType: ReactionType) => Promise<void>;
  getPostsByCategory: (category: Category) => Post[];
  addComment: (postId: string, content: string) => Promise<void>;
  getComments: (postId: string) => Promise<CommentType[]>;
}

export interface Post {
  $id?: string;
  content: string;
  timestamp: string | Date;
  reactions: {
    hearts: number;
    flames: number;
    cry: number;
    smile: number;
    laugh: number;
    neutral: number;
  };
  category?: Category;
  userReactions?: {
    [key in ReactionType]?: boolean;
  };
}

export interface CommentType {
  $id?: string;
  postId: string;
  content: string;
  timestamp: string;
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
        const userReactions: { [key in ReactionType]: boolean } = {
          hearts: !!reactedPosts[`${post.$id}_hearts`],
          flames: !!reactedPosts[`${post.$id}_flames`],
          cry: !!reactedPosts[`${post.$id}_cry`],
          smile: !!reactedPosts[`${post.$id}_smile`],
          laugh: !!reactedPosts[`${post.$id}_laugh`],
          neutral: !!reactedPosts[`${post.$id}_neutral`],
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
        reactions: { hearts: 0, flames: 0, cry: 0, smile: 0, laugh: 0, neutral: 0 },
        category,
      };

      const response = await databases.createDocument(DB_ID, COLLECTION_POST_ID, ID.unique(), newPost);

      const userReactions = {
        hearts: false,
        flames: false,
        cry: false,
        smile: false,
        laugh: false,
        neutral: false,
      };

      setPosts(prevPosts => [{ ...(response as Post), userReactions }, ...prevPosts]);
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const addReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      const reactedPosts = JSON.parse(localStorage.getItem('reactedPosts') || '{}');
      const currentReactionKey = Object.keys(reactedPosts).find(key => key.startsWith(`${postId}_`));
      const currentReaction = currentReactionKey ? currentReactionKey.split('_')[1] as ReactionType : null;

      const post = posts.find(p => p.$id === postId);
      if (!post) return;

      const updatedReactions = { ...post.reactions };

      if (currentReaction === reactionType) {
        updatedReactions[reactionType] = Math.max(0, (post.reactions[reactionType] || 1) - 1);
        delete reactedPosts[currentReactionKey!];
      } else {
        if (currentReaction) {
          updatedReactions[currentReaction] = Math.max(0, (post.reactions[currentReaction] || 1) - 1);
          delete reactedPosts[currentReactionKey!];
        }
        updatedReactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
        reactedPosts[`${postId}_${reactionType}`] = true;
      }

      await databases.updateDocument(DB_ID, COLLECTION_POST_ID, postId, {
        reactions: updatedReactions,
      });

      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.$id !== postId) return p;
          const newUserReactions: { [key in ReactionType]: boolean } = {
            hearts: false,
            flames: false,
            cry: false,
            smile: false,
            laugh: false,
            neutral: false,
          };
          if (currentReaction !== reactionType) {
            newUserReactions[reactionType] = true;
          }

          return {
            ...p,
            reactions: updatedReactions,
            userReactions: newUserReactions,
          };
        })
      );

      localStorage.setItem('reactedPosts', JSON.stringify(reactedPosts));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const getPostsByCategory = (category: Category) => {
    return posts.filter(post => post.category === category);
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const comment: Omit<CommentType, '$id'> = {
        postId,
        content,
        timestamp: new Date().toISOString(),
      };
      await databases.createDocument(DB_ID, COLLECTION_COMMENT_ID, ID.unique(), comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getComments = async (postId: string): Promise<CommentType[]> => {
    try {
      const response = await databases.listDocuments(DB_ID, COLLECTION_COMMENT_ID, [
        Query.equal('postId', postId),
        Query.orderDesc('timestamp'),
      ]);
      return response.documents as CommentType[];
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  };

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const totalA = Object.values(a.reactions).reduce((acc, val) => acc + val, 0);
      const totalB = Object.values(b.reactions).reduce((acc, val) => acc + val, 0);
      return totalB - totalA;
    })
    .slice(0, 10);

  return (
    <PostContext.Provider
      value={{
        posts,
        trendingPosts,
        addPost,
        addReaction,
        getPostsByCategory,
        addComment,
        getComments,
      }}
    >
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
