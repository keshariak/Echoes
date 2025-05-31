import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Heart, Search } from 'lucide-react';
import Logo from '../../logo/logo1.png';
import Logo2 from '../../logo/logo2.png';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled 
          ? theme === 'dark' 
            ? 'bg-dark-200 shadow-lg' 
            : 'bg-white shadow-md'
          : theme === 'dark'
            ? 'bg-transparent'
            : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          {/* <Heart className="w-6 h-6 text-primary-500" fill="currentColor" /> */}
          {
            theme === "dark"?
             <img className='w-8 h-8' src={Logo} alt="" /> 
             : <img className='w-8 h-8' src={Logo2} alt="" />
          }
          
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            AnonyMess
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" current={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/trending" current={location.pathname === '/trending'}>
            Trending
          </NavLink>
          {/* <NavLink to="/search" current={location.pathname === '/search'}>
            <Search className="w-4 h-4 mr-1" />
            Search
          </NavLink> */}
          <NavLink to="/groups" current={location.pathname === '/groups'}>  
            Group
          </NavLink>
          <NavLink to="/live" current={location.pathname === '/live'}>
            <span className="relative mr-1">
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </NavLink>
        </nav>
        <div className='flex'>
         <NavLink to="/search" current={location.pathname === '/search'}>
            <Search className="w-5 h-5 mr-1" />
            
          </NavLink>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-300" />
          ) : (
            <Moon className="w-5 h-5 text-primary-600" />
          )}
        </button>
        </div>
       
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-around border-t border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-200 fixed bottom-0 left-0 right-0 py-2">
        <MobileNavLink to="/" current={location.pathname === '/'}>
          Home
        </MobileNavLink>
        <MobileNavLink to="/trending" current={location.pathname === '/trending'}>
          Trending
        </MobileNavLink>
        <MobileNavLink to="/groups" current={location.pathname === '/groups'}>
          Group
        </MobileNavLink>
        {/* <MobileNavLink to="/search" current={location.pathname === '/search'}>
          Search
        </MobileNavLink> */}
        <MobileNavLink to="/live" current={location.pathname === '/live'}>
          Live
        </MobileNavLink>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  current: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, current, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
      current
        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, current, children }) => (
  <Link
    to={to}
    className={`px-3 py-1 text-xs font-medium text-center rounded-md ${
      current
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    {children}
  </Link>
);

export default Header;