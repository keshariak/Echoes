export type ThemeType = 'light' | 'dark';

export interface Post {
  id: string;
  content: string;
  timestamp: Date;
  reactions: {
    hearts: number;
    flames: number;
    frowns: number;
  };
  category?: Category;
}

export type Category = 
  | 'family'
  | 'college'
  | 'work'
  | 'mental-health'
  | 'relationships'
  | 'success'
  | 'failure'
  | 'happiness'
  | 'sadness'
  | 'anger'
  | 'anxiety'
  | 'other';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
}