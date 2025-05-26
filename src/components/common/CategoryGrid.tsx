import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';
import { Brain, Home, GraduationCap, Briefcase, Heart, Trophy, XCircle, Smile, Frown, Flame, AlertCircle, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'brain': <Brain className="w-5 h-5" />,
  'home': <Home className="w-5 h-5" />,
  'graduation-cap': <GraduationCap className="w-5 h-5" />,
  'briefcase': <Briefcase className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'trophy': <Trophy className="w-5 h-5" />,
  'x-circle': <XCircle className="w-5 h-5" />,
  'smile': <Smile className="w-5 h-5" />,
  'frown': <Frown className="w-5 h-5" />,
  'flame': <Flame className="w-5 h-5" />,
  'alert-circle': <AlertCircle className="w-5 h-5" />,
  'more-horizontal': <MoreHorizontal className="w-5 h-5" />,
};

const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-100 rounded-lg shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 mb-2">
            {iconMap[category.icon]}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;