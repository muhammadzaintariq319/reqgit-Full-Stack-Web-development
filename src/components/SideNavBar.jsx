import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideNavBar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Documents', path: '/documents', icon: 'description' },
    { name: 'Recent Activity', path: '/activity', icon: 'history' },
    { name: 'Members', path: '/team', icon: 'group' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <nav className="hidden md:flex flex-col p-md gap-sm bg-surface-container-low dark:bg-inverse-surface fixed left-0 top-14 bottom-0 w-60 border-r border-outline-variant dark:border-outline z-30">
      <div className="flex items-center gap-sm mb-lg mt-sm px-xs">
        <div aria-label="Workspace Icon" className="w-10 h-10 rounded bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
          G
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-primary leading-tight truncate">Global Workspace</h2>
          <p className="text-xs text-on-surface-variant truncate">Enterprise Plan</p>
        </div>
      </div>
      
      <Link to="/documents" className="flex items-center justify-center gap-xs bg-primary text-on-primary font-button text-button rounded-lg py-sm px-md mb-md hover:bg-primary-fixed-variant transition-colors active:bg-primary-fixed">
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Document
      </Link>

      <div className="flex-grow flex flex-col gap-xs">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link 
              key={link.name}
              to={link.path}
              className={`flex items-center gap-sm px-md py-sm rounded-lg transition-colors duration-150 ${
                isActive 
                  ? 'bg-surface-container-highest dark:bg-on-secondary-fixed-variant text-primary font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-on-secondary-fixed-variant'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill-icon' : ''}`}>
                {link.icon}
              </span>
              <span className="font-body-sm text-body-sm">{link.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <Link to="/docs" className="flex items-center gap-sm text-on-surface-variant px-md py-sm hover:bg-surface-container-highest dark:hover:bg-on-secondary-fixed-variant transition-colors duration-150 rounded-lg">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-body-sm text-body-sm">Help Center</span>
        </Link>
      </div>
    </nav>
  );
};

export default SideNavBar;
