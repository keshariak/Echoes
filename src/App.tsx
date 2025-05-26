import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PostProvider } from './context/PostContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Search from './pages/Search';
import Live from './pages/Live';
import CategoryView from './pages/CategoryView';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PostProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-300 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Header />
            <div className="pt-16 pb-16 md:pb-0 container mx-auto">
              <div className="flex">
                <Sidebar />
                <main className="flex-1 py-6">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/trending" element={<Trending />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/category/:categoryId" element={<CategoryView />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
        </PostProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;