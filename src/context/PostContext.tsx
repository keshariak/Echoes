import React, { createContext, useContext, useEffect, useState } from 'react';
// import { Post, Category } from '../types';
import { databases, DB_ID, COLLECTION_POST_ID, COLLECTION_REACTION_ID, Query } from '../configs/appwriteCongig';
import { ID } from 'appwrite';

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
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Fetch posts from Appwrite
  const fetchPosts = async () => {
    
    try {
      const response = await databases.listDocuments(DB_ID, COLLECTION_POST_ID, [
        Query.orderDesc('timestamp'),
      ]);
      console.log(response)
      const fetchedPosts = response.documents as Post[];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }

  };

  useEffect(() => {
    fetchPosts();
  }, []);

  //Add a new post to Appwrite
  const addPost = async (content: string, category?: Category) => {
    try {
      const newPost: Omit<Post, 'id'> = {
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
      setPosts(prevPosts => [response as Post, ...prevPosts]);
    } catch (error) {
      console.error("Failed to add post:", error);
    }
  };






  // Add a reaction (updates post)
  const addReaction = async (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => {
    try {
      const post = posts.find(p => p.$id === postId);
      if (!post) return;

      const updatedReactions = {
        ...post.reactions,
        [reactionType]: post.reactions[reactionType] + 1,
      };

      const updatedPost = await databases.updateDocument(DB_ID, COLLECTION_POST_ID, postId, {
        reactions: updatedReactions,
      });

      setPosts(prevPosts =>
        prevPosts.map(p => (p.$id === postId ? (updatedPost as Post) : p))
      );
    } catch (error) {
      console.error("Failed to update reaction:", error);
    }
  };

  //add Reactio Updated so one can only like one time
//   const addReaction = async (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => {
//   try {
//     const reactedPosts = JSON.parse(localStorage.getItem('reactedPosts') || '{}');

//     if (reactedPosts[postId]) {
//       console.warn('Already reacted to this post');
//       return;
//     }

//     const post = posts.find(p => p.$id === postId);
//     if (!post) return;

//     const updatedReactions = {
//       ...post.reactions,
//       [reactionType]: post.reactions[reactionType] + 1,
//     };

//     const updatedPost = await databases.updateDocument(DB_ID, COLLECTION_POST_ID, postId, {
//       reactions: updatedReactions,
//     });

//     // Update state
//     setPosts(prevPosts =>
//       prevPosts.map(p => (p.$id === postId ? (updatedPost as Post) : p))
//     );

//     // Save in localStorage to prevent more reactions
//     reactedPosts[postId] = reactionType;
//     localStorage.setItem('reactedPosts', JSON.stringify(reactedPosts));

//   } catch (error) {
//     console.error("Failed to update reaction:", error);
//   }
// };


  // Filter posts by category
  const getPostsByCategory = (category: Category) => {
    return posts.filter(post => post.category === category);
  };

  // Trending posts sorted by reaction counts
  const trendingPosts = [...posts]
    .sort((a, b) => {
      const totalA = a.reactions.hearts + a.reactions.flames;
      const totalB = b.reactions.hearts + b.reactions.flames;
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
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

