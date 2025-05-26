import { Post, Category, CategoryInfo } from '../types';

export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'I wish I could restart life',
    timestamp: new Date('2025-05-15T14:22:00'),
    reactions: {
      hearts: 14,
      flames: 8,
      frowns: 5,
    },
    category: 'mental-health',
  },
  {
    id: '2',
    content: 'I miss the old me',
    timestamp: new Date('2025-05-15T13:45:00'),
    reactions: {
      hearts: 22,
      flames: 10,
      frowns: 9,
    },
    category: 'mental-health',
  },
  {
    id: '3',
    content: 'I laughed today, finally',
    timestamp: new Date('2025-05-15T12:30:00'),
    reactions: {
      hearts: 30,
      flames: 5,
      frowns: 1,
    },
    category: 'happiness',
  },
  {
    id: '4',
    content: 'Failed my exam today. Feeling like a complete failure. Not sure how to tell my parents, they have such high expectations for me.',
    timestamp: new Date('2025-05-15T11:20:00'),
    reactions: {
      hearts: 18,
      flames: 7,
      frowns: 2,
    },
    category: 'college',
  },
  {
    id: '5',
    content: 'My partner just told me they need space. After 3 years together, I don\'t know what to do with myself now.',
    timestamp: new Date('2025-05-15T10:15:00'),
    reactions: {
      hearts: 25,
      flames: 12,
      frowns: 7,
    },
    category: 'relationships',
  },
  {
    id: '6',
    content: 'Got promoted today! All those late nights finally paid off!',
    timestamp: new Date('2025-05-15T09:30:00'),
    reactions: {
      hearts: 45,
      flames: 20,
      frowns: 0,
    },
    category: 'success',
  },
  {
    id: '7',
    content: 'My anxiety is through the roof today. Every phone notification makes me jump.',
    timestamp: new Date('2025-05-15T08:45:00'),
    reactions: {
      hearts: 16,
      flames: 9,
      frowns: 4,
    },
    category: 'anxiety',
  },
  {
    id: '8',
    content: 'Had a big argument with my mom again. Why can\'t she understand that I need to live my own life?',
    timestamp: new Date('2025-05-15T07:30:00'),
    reactions: {
      hearts: 12,
      flames: 15,
      frowns: 3,
    },
    category: 'family',
  },
];

export const categories: CategoryInfo[] = [
  { id: 'mental-health', name: 'Mental Health', icon: 'brain' },
  { id: 'family', name: 'Family', icon: 'home' },
  { id: 'college', name: 'College', icon: 'graduation-cap' },
  { id: 'work', name: 'Work', icon: 'briefcase' },
  { id: 'relationships', name: 'Relationships', icon: 'heart' },
  { id: 'success', name: 'Success', icon: 'trophy' },
  { id: 'failure', name: 'Failure', icon: 'x-circle' },
  { id: 'happiness', name: 'Happiness', icon: 'smile' },
  { id: 'sadness', name: 'Sadness', icon: 'frown' },
  { id: 'anger', name: 'Anger', icon: 'flame' },
  { id: 'anxiety', name: 'Anxiety', icon: 'alert-circle' },
  { id: 'other', name: 'Other', icon: 'more-horizontal' },
];