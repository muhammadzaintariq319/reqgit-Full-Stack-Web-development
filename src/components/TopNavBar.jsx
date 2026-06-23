import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopNavBar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  
  const notifRef = useRef(null);
  const helpRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Get user info from local storage
  const userString = localStorage.getItem('reqgit_user');
  const user = userString ? JSON.parse(userString) : { full_name: 'User', email: '' };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };
  
  const userInitials = getInitials(user.full_name);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (helpRef.current && !helpRef.current.contains(event.target)) setIsHelpOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-surface text-primary font-body-sm text-body-sm fixed top-0 w-full z-40 border-b border-outline-variant flex justify-between items-center h-14 px-md">
      <div className="flex items-center gap-md">
        <Link to="/dashboard" className="text-title-md font-title-md font-bold text-primary">
          ReqGit
        </Link>
        <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded px-sm py-1 ml-md w-64 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input 
            className="bg-transparent border-none outline-none focus:ring-0 text-body-sm font-body-sm w-full ml-xs text-on-surface placeholder:text-on-surface-variant" 
            placeholder="Search spaces, documents..." 
            type="text" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-sm relative">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsHelpOpen(false); setIsProfileOpen(false); }}
            className={`p-1 rounded transition-colors cursor-pointer active:scale-95 flex items-center justify-center ${isNotifOpen ? 'bg-surface-container-highest text-primary' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface border border-outline-variant rounded-xl shadow-md overflow-hidden z-50">
              <div className="p-3 border-b border-outline-variant bg-surface-container-lowest">
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <span className="material-symbols-outlined text-outline text-4xl mb-2">notifications_paused</span>
                <p className="text-body-sm text-on-surface-variant">You're all caught up!</p>
              </div>
              <div className="p-2 border-t border-outline-variant text-center bg-surface-container-lowest">
                <button className="text-primary hover:text-blue-700 text-xs font-medium">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Help Dropdown */}
        <div className="relative" ref={helpRef}>
          <button 
            onClick={() => { setIsHelpOpen(!isHelpOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
            className={`p-1 rounded transition-colors cursor-pointer active:scale-95 flex items-center justify-center ${isHelpOpen ? 'bg-surface-container-highest text-primary' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          
          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-md overflow-hidden z-50 py-1">
              <Link to="/docs" className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">menu_book</span>
                Documentation
              </Link>
              <a href="mailto:support@reqgit.com" className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low text-on-surface transition-colors text-left">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">support_agent</span>
                Contact Support
              </a>
              <div className="border-t border-outline-variant my-1"></div>
              <button 
                onClick={() => { setIsHelpOpen(false); setIsShortcutsOpen(true); }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low text-on-surface transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">keyboard</span>
                Shortcuts
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsHelpOpen(false); }}
            className={`w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-title-sm text-title-sm cursor-pointer border ml-sm transition-all select-none ${isProfileOpen ? 'ring-2 ring-primary border-primary' : 'border-outline-variant hover:ring-2 hover:ring-primary/50'}`}
          >
            {userInitials}
          </div>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-xl shadow-md overflow-hidden z-50 py-1">
              <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
                <p className="text-body-sm font-medium text-on-surface">{user.full_name}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
              </div>
              
              <div className="py-1">
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                  My Profile
                </Link>
                <Link to="/settings#security" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                  Account Settings
                </Link>
              </div>
              
              <div className="border-t border-outline-variant my-1"></div>
              
              <div className="py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-error-container hover:text-on-error-container text-error transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg w-full max-w-sm overflow-hidden transform transition-all">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h2 className="font-title-md text-title-md text-on-surface">
                Keyboard Shortcuts
              </h2>
              <button 
                className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container transition-colors"
                onClick={() => setIsShortcutsOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface">Global Search</span>
                <kbd className="bg-surface-container-high px-2 py-1 rounded text-xs font-mono border border-outline-variant text-on-surface">Ctrl + K</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface">New Document</span>
                <kbd className="bg-surface-container-high px-2 py-1 rounded text-xs font-mono border border-outline-variant text-on-surface">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface">Help Menu</span>
                <kbd className="bg-surface-container-high px-2 py-1 rounded text-xs font-mono border border-outline-variant text-on-surface">Shift + ?</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface">Close Modals</span>
                <kbd className="bg-surface-container-high px-2 py-1 rounded text-xs font-mono border border-outline-variant text-on-surface">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNavBar;
