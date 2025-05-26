import React from 'react';
import { Heart, Flame, Frown } from 'lucide-react';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { addReaction } = usePosts();

  const formatTime = (timestampString: string) => {
    const timestamp = new Date(timestampString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-4 animate-fade-in">
      <div className="mb-3">
        <p className="text-gray-900 dark:text-gray-100 text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-dark-200">
        <div className="flex space-x-4">
          <ReactionButton
            count={post.reactions.hearts}
            icon={<Heart className="w-5 h-5" />}
            color="text-red-500"
            onClick={() => addReaction(post.$id, 'hearts')}
          />
          <ReactionButton
            count={post.reactions.flames}
            icon={<Flame className="w-5 h-5" />}
            color="text-orange-500"
            onClick={() => addReaction(post.$id, 'flames')}
          />
          <ReactionButton
            count={post.reactions.frowns}
            icon={<Frown className="w-5 h-5" />}
            color="text-gray-500"
            onClick={() => addReaction(post.$id, 'frowns')}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(post.timestamp as any)}
        </span>
      </div>
    </div>
  );
};

interface ReactionButtonProps {
  count: number;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ count, icon, color, onClick }) => {
  return (
    <button
      className="flex items-center space-x-1 group"
      onClick={onClick}
    >
      <span className={`${color} transition-transform group-hover:scale-110`}>
        {icon}
      </span>
      <span className="text-gray-600 dark:text-gray-400 text-sm">{count}</span>
    </button>
  );
};

export default PostCard;
