import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PostProvider } from './context/PostContext';
import { GroupProvider } from './context/GroupContext';
import { MessagesProvider } from './context/GroupchatContext';  // ✅ Import MessagesProvider

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Search from './pages/Search';
import Live from './pages/Live';
import CategoryView from './pages/CategoryView';
import Groups from './components/groups/Groups';
import GroupChat from './components/groups/GroupChat';

// Wrapper component to get groupId param and provide MessagesProvider
const GroupChatWrapper: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  if (!groupId) return null; // or some fallback UI

  return (
    <MessagesProvider groupId={groupId}>
      <GroupChat />
    </MessagesProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PostProvider>
          <GroupProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-300 text-gray-900 dark:text-gray-100 transition-colors duration-200">
              <Header />
              <div className="pt-10 pb-3 md:pb-0 container mx-auto">
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 py-6">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/live" element={<Live />} />
                      <Route path="/category/:categoryId" element={<CategoryView />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/groups/:groupId/chat" element={<GroupChatWrapper />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </div>
          </GroupProvider>
        </PostProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
