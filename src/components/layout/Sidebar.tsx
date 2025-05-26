import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';
import { Brain, Home, GraduationCap, Briefcase, Heart, Trophy, XCircle, Smile, Frown, Flame, AlertCircle, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'brain': <Brain className="w-4 h-4" />,
  'home': <Home className="w-4 h-4" />,
  'graduation-cap': <GraduationCap className="w-4 h-4" />,
  'briefcase': <Briefcase className="w-4 h-4" />,
  'heart': <Heart className="w-4 h-4" />,
  'trophy': <Trophy className="w-4 h-4" />,
  'x-circle': <XCircle className="w-4 h-4" />,
  'smile': <Smile className="w-4 h-4" />,
  'frown': <Frown className="w-4 h-4" />,
  'flame': <Flame className="w-4 h-4" />,
  'alert-circle': <AlertCircle className="w-4 h-4" />,
  'more-horizontal': <MoreHorizontal className="w-4 h-4" />,
};

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:block sticky top-20 w-60 h-[calc(100vh-5rem)] overflow-y-auto pt-6 pb-12 pl-4">
      <div className="pr-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 px-3">Categories</h2>
        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-dark-100 transition-colors"
            >
              <span className="mr-3 text-gray-500 dark:text-gray-400">
                {iconMap[category.icon]}
              </span>
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-3">
          <div className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 p-4 rounded-lg">
            <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-2">Welcome to Echo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A safe space to share your feelings anonymously. Be kind and supportive to others.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;