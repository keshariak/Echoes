import React, { useState, useEffect } from 'react';
import PostInput from '../components/posts/PostInput';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Post } from '../types';
import { Radio } from 'lucide-react';

const Live: React.FC = () => {
  const { posts } = usePosts();
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  
  // Simulate live updates
  useEffect(() => {
    setLivePosts(posts.slice(0, 3));
    
    const interval = setInterval(() => {
      if (posts.length > 0) {
        const randomIndex = Math.floor(Math.random() * posts.length);
        const randomPost = posts[randomIndex];
        setLivePosts(prev => [randomPost, ...prev.slice(0, 19)]);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [posts]);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Radio className="w-6 h-6 text-green-500 mr-2 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Echoes</h1>
      </div>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          See feelings as they're being shared in real-time. Add your voice to the conversation.
        </p>
      </div>
      <PostInput />
      <div className="mt-6">
        <PostList posts={livePosts} emptyMessage="No live posts yet. Be the first to share!" />
      </div>
    </div>
  );
};

export default Live;