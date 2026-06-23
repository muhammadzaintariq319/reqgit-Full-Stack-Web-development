import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadProfilePicture, removeProfilePicture, changePassword, updateProfile, API_BASE_URL } from '../utils/api';

const Settings = () => {
  const userString = localStorage.getItem('reqgit_user');
  const [user, setUser] = useState(userString ? JSON.parse(userString) : { full_name: '', email: '', profile_pic: null });
  
  const [profilePic, setProfilePic] = useState(user.profile_pic);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const firstName = user.full_name ? user.full_name.split(' ')[0] : '';
  const lastName = user.full_name && user.full_name.split(' ').length > 1 ? user.full_name.split(' ').slice(1).join(' ') : '';

  const [profileFirstName, setProfileFirstName] = useState(firstName);
  const [profileLastName, setProfileLastName] = useState(lastName);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileUpdating, setProfileUpdating] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const res = await uploadProfilePicture(file);
      setProfilePic(res.profile_pic);
      
      const updatedUser = { ...user, profile_pic: res.profile_pic };
      localStorage.setItem('reqgit_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('reqgit_user_updated')); // Custom event for other components
    } catch (err) {
      alert("Failed to upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!profilePic) return;
    try {
      await removeProfilePicture();
      setProfilePic(null);
      
      const updatedUser = { ...user, profile_pic: null };
      localStorage.setItem('reqgit_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('reqgit_user_updated'));
    } catch (err) {
      alert("Failed to remove: " + err.message);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    
    setPasswordUpdating(true);
    try {
      await changePassword(currentPassword, newPassword);
      alert("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.message);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!profileFirstName || !profileLastName || !profileEmail) {
      alert("First name, last name, and email are required.");
      return;
    }

    setProfileUpdating(true);
    try {
      const fullName = `${profileFirstName} ${profileLastName}`;
      const res = await updateProfile(fullName, profileEmail);
      
      const updatedUser = { ...user, full_name: res.user.full_name, email: res.user.email };
      localStorage.setItem('reqgit_user', JSON.stringify(updatedUser));
      if (res.token) {
        localStorage.setItem('reqgit_token', res.token);
      }
      setUser(updatedUser);
      window.dispatchEvent(new Event('reqgit_user_updated'));
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);
  
  const [notifications, setNotifications] = useState({
    documentUpdates: true,
    workspaceActivity: true,
    marketing: false
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const rootEl = document.getElementById('settings-scroll-container');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, { 
      root: rootEl,
      rootMargin: '-20% 0px -60% 0px' 
    });

    ['profile', 'security', 'preferences'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-lg md:mb-xl flex justify-between items-end border-b border-outline-variant pb-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">User Settings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Manage your personal profile, security preferences, and notification settings.</p>
        </div>
        <div className="hidden md:flex gap-sm">
          <button onClick={handleCancel} className="border border-outline-variant text-on-surface hover:bg-surface-container-low font-button text-button py-sm px-md rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveChanges} disabled={profileUpdating} className="bg-primary text-on-primary hover:bg-[#003ea8] font-button text-button py-sm px-md rounded-lg transition-colors disabled:opacity-50">{profileUpdating ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      {/* Settings Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-lg min-h-0 overflow-hidden">
        {/* Left Column: Navigation/TOC */}
        <div className="hidden lg:flex flex-col lg:w-64 flex-shrink-0">
          <div className="flex flex-col gap-xs">
            <a 
              onClick={() => setActiveTab('profile')}
              className={`${activeTab === 'profile' ? 'text-primary font-medium border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'} border-l-2 pl-sm py-xs text-body-sm transition-colors`} 
              href="#profile"
            >
              Profile Information
            </a>
            <a 
              onClick={() => setActiveTab('security')}
              className={`${activeTab === 'security' ? 'text-primary font-medium border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'} border-l-2 pl-sm py-xs text-body-sm transition-colors`} 
              href="#security"
            >
              Security & Password
            </a>
            <a 
              onClick={() => setActiveTab('preferences')}
              className={`${activeTab === 'preferences' ? 'text-primary font-medium border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'} border-l-2 pl-sm py-xs text-body-sm transition-colors`} 
              href="#preferences"
            >
              Application Preferences
            </a>
          </div>
        </div>

        {/* Right Column: Settings Content */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-lg pr-sm pb-xl" id="settings-scroll-container">
          {/* Profile Section */}
          <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" id="profile">
            <div className="border-b border-surface-dim bg-surface-bright px-md py-sm">
              <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">person</span>
                Profile Information
              </h2>
            </div>
            <div className="p-md flex flex-col gap-md">
              <div className="flex items-center gap-md">
                <div className="relative">
                  {profilePic ? (
                    <img src={`${API_BASE_URL}/${profilePic}`} alt="Profile" className="w-20 h-20 rounded-full border border-outline-variant object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border border-outline-variant bg-surface-container-high flex items-center justify-center text-title-md font-bold">{getInitials(user.full_name)}</div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-surface border border-outline-variant rounded-full p-xs text-on-surface hover:bg-surface-container-low transition-colors" 
                    title="Change Avatar"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
                <div>
                  <h3 className="font-body-sm text-body-sm font-medium text-on-surface">Profile Picture</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-xs">PNG, JPG or GIF up to 5MB.</p>
                  <div className="mt-sm flex gap-sm">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/gif" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border border-outline-variant text-on-surface hover:bg-surface-container-low font-button text-button py-[4px] px-sm rounded text-xs transition-colors disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Upload New'}
                    </button>
                    {profilePic && (
                      <button 
                        onClick={handleRemove}
                        className="text-error hover:bg-error-container hover:text-on-error-container font-button text-button py-[4px] px-sm rounded text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-body-sm text-body-sm font-medium text-on-surface" htmlFor="firstName">First Name</label>
                  <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="firstName" type="text" value={profileFirstName} onChange={(e) => setProfileFirstName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-body-sm text-body-sm font-medium text-on-surface" htmlFor="lastName">Last Name</label>
                  <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="lastName" type="text" value={profileLastName} onChange={(e) => setProfileLastName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-xs md:col-span-2">
                  <label className="font-body-sm text-body-sm font-medium text-on-surface" htmlFor="email">Email Address</label>
                  <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-xs md:col-span-2">
                  <label className="font-body-sm text-body-sm font-medium text-on-surface" htmlFor="bio">Short Bio (Optional)</label>
                  <textarea className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface resize-none" id="bio" rows="3" defaultValue="Senior requirements engineer focusing on API documentation."></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" id="security">
            <div className="border-b border-surface-dim bg-surface-bright px-md py-sm">
              <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">security</span>
                Security & Password
              </h2>
            </div>
            <div className="p-md flex flex-col gap-lg">
              <div>
                <h3 className="font-body-sm text-body-sm font-medium text-on-surface mb-sm">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface-variant text-xs" htmlFor="currentPassword">Current Password</label>
                    <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface-variant text-xs" htmlFor="newPassword">New Password</label>
                    <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface-variant text-xs" htmlFor="confirmPassword">Confirm New Password</label>
                    <input className="border border-outline-variant rounded-md px-sm py-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-on-surface bg-surface" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <div className="mt-sm">
                  <button onClick={handlePasswordUpdate} disabled={passwordUpdating} className="border border-outline-variant text-on-surface hover:bg-surface-container-low font-button text-button py-[6px] px-sm rounded-md text-sm transition-colors disabled:opacity-50">
                    {passwordUpdating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" id="preferences">
            <div className="border-b border-surface-dim bg-surface-bright px-md py-sm">
              <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">tune</span>
                Application Preferences
              </h2>
            </div>
            <div className="p-md flex flex-col gap-lg">
              <div>
                <h3 className="font-body-sm text-body-sm font-medium text-on-surface mb-sm">Email Notifications</h3>
                <div className="space-y-sm">
                  <label className="flex items-start gap-sm cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2" 
                      checked={notifications.documentUpdates}
                      onChange={() => toggleNotification('documentUpdates')}
                    />
                    <div>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium group-hover:text-primary transition-colors">Document Updates</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-sm">Receive emails when comments or edits are made on documents you are watching.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-sm cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2" 
                      checked={notifications.workspaceActivity}
                      onChange={() => toggleNotification('workspaceActivity')}
                    />
                    <div>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium group-hover:text-primary transition-colors">Workspace Activity</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-sm">Weekly digest of activities within your assigned workspaces.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-sm cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2" 
                      checked={notifications.marketing}
                      onChange={() => toggleNotification('marketing')}
                    />
                    <div>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium group-hover:text-primary transition-colors">Marketing & Product News</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-sm">Updates on new ReqGit features, webinars, and promotions.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
