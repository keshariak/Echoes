import React, { useState, useRef, useEffect } from 'react';
import { Heart, Flame, Frown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../../types';
import { usePosts } from '../../context/PostContext';

interface PostCardProps {
  post: Post;
}

const EMOJI_OPTIONS = [
  { key: 'cry', emoji: '😢' },
  { key: 'smile', emoji: '🙂' },
  { key: 'laugh', emoji: '😂' },
  { key: 'neutral', emoji: '😐' },
];

const REACTION_ICONS: any = {
  hearts: <Heart className="w-5 h-5" />,
  flames: <Flame className="w-5 h-5" />,
  cry: '😢',
  smile: '🙂',
  laugh: '😂',
  neutral: '😐',
};

const EMOJI_KEYS = ['cry', 'smile', 'laugh', 'neutral'];

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { addReaction, addComment, getComments } = usePosts();

  const [showReplies, setShowReplies] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const [comments, setComments] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId') || '';
const reactedPosts = JSON.parse(localStorage.getItem('reactedPosts') || '{}');
const userReaction = Object.keys(reactedPosts)
  .find(key => key.startsWith(`${post.$id}_`))
  ?.split('_')[1] || null;
const loadComments = async () => {
  const fetched = await getComments(post.$id!);
  setComments(fetched);
  setCommentCount(fetched.length);
};

  useEffect(() => {
    // if (showReplies)
       loadComments();
  }, [showReplies]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

const handleAddReply = async () => {
  if (!replyContent.trim()) return;
  await addComment(post.$id!, replyContent.trim());
  
  setReplyContent('');
  setIsReplying(false);

  // Optimistically update UI
  setComments(prev => [{
    $id: Date.now().toString(),
    postId: post.$id!,
    content: replyContent.trim(),
    timestamp: new Date().toISOString(),
  }, ...prev]);
  
  setCommentCount(prev => prev + 1); 
};


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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-dark-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 mb-4"
    >
      <div className="mb-3">
        <p className="text-gray-900 dark:text-gray-100 text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400">
          {formatTime(post.timestamp)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-dark-200">
        <div className="flex flex-row flex-wrap items-center gap-1.5 ">
          {/* Base reactions */}
          {['hearts', 'flames'].map(type => (
            <ReactionButton
              key={type}
              count={post.reactions[type] || 0}
              reactionType={type}
              isActive={userReaction === type}
              onClick={() => addReaction(post.$id!, type)}
            />
          ))}

          {/* Emoji reactions */}
          {EMOJI_KEYS.map(key => (
            (post.reactions[key] || 0) > 0 && (
              <button
                key={key}
                onClick={() => addReaction(post.$id!, key)}
                className={`flex  items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors text-base ${userReaction === key ? ' dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-dark-200'}`}
              >
                <span>{REACTION_ICONS[key]}</span>
                <span className="text-xs font-medium">{post.reactions[key]}</span>
              </button>
            )
          ))}

          {/* Emoji Picker Toggle */}
          <div className="relative" ref={pickerRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200"
            >
              <Frown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </motion.button>
            {showEmojiPicker && (
              <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-3 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-100 rounded-xl shadow-xl p-2 flex gap-2">
                {(userReaction && EMOJI_KEYS.includes(userReaction)
                  ? EMOJI_OPTIONS.filter(option => option.key !== userReaction)
                  : EMOJI_OPTIONS
                ).map(option => (
                  <button
                    key={option.key}
                    className="text-xl hover:scale-125 transition-transform"
                    onClick={() => {
                      addReaction(post.$id!, option.key);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-gray-500 group px-1.5 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentCount}</span>

        </motion.button>
      </div>

      {/* Replies Section */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {comments.map((reply) => (
              <motion.div
                key={reply.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3"
              >
                <p className="text-sm text-gray-800 dark:text-gray-200">{reply.content}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  {formatTime(reply.timestamp)}
                </span>
              </motion.div>
            ))}

            {!isReplying ? (
              <button
                onClick={() => setIsReplying(true)}
                className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
              >
                Add a reply...
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-300 text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleAddReply}
                  className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Reply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ReactionButtonProps {
  count: number;
  reactionType: 'hearts' | 'flames' | 'frowns';
  isActive: boolean;
  onClick: () => void;
  size: 'small' | 'large';
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ count, reactionType, isActive, onClick, size }) => {
  const colors = {
    hearts: { active: '#EF4444', inactive: '#6B7280' }, // red-500 and gray-500
    flames: { active: '#F97316', inactive: '#6B7280' }, // orange-500 and gray-500
    frowns: { active: '#3B82F6', inactive: '#6B7280' }, // A shade of blue when active, gray when inactive
  };

  const iconColor = isActive ? colors[reactionType].active : colors[reactionType].inactive;
  const iconFill = isActive && reactionType !== 'frowns' ? colors[reactionType].active : 'none';

  const IconComponent = reactionType === 'hearts' ? Heart : reactionType === 'flames' ? Flame : Frown;

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }} 
      className={`flex items-center space-x-1 group ${isActive ? '' : 'opacity-70 hover:opacity-100'}`}
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        <motion.span 
          key={reactionType + (isActive ? '-active' : '-inactive')}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: isActive ? 1.2 : 1, opacity: 1 }}
          exit={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {isActive ? (
            <span className="w-5 h-5 flex items-center justify-center">
              {reactionType === 'hearts' && '❤️'}
              {reactionType === 'flames' && '🔥'}
              {reactionType === 'frowns' && '😟'}
            </span>
          ) : (
            <IconComponent 
              className="w-5 h-5"
              color={iconColor}
              fill={iconFill}
            />
          )}
        </motion.span>
      </AnimatePresence>
      <motion.span className="text-gray-600 dark:text-gray-400 text-sm">{count}</motion.span>
    </motion.button>
  );
};

export default PostCard;