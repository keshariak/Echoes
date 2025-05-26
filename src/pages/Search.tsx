import React, { useState } from 'react';
import SearchBar from '../components/search/SearchBar';
import CategoryGrid from '../components/common/CategoryGrid';
import PostList from '../components/posts/PostList';
import { usePosts } from '../context/PostContext';
import { Post } from '../types';

const Search: React.FC = () => {
  const { posts } = usePosts();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    const results = posts.filter(post => 
      post.content.toLowerCase().includes(query.toLowerCase()) || 
      post.category?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discover</h1>
      <SearchBar onSearch={handleSearch} />
      
      {hasSearched ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Search Results
          </h2>
          <PostList 
            posts={searchResults} 
            emptyMessage="No posts found matching your search criteria." 
          />
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Browse by Category
          </h2>
          <CategoryGrid />
        </>
      )}
    </div>
  );
};

export default Search;