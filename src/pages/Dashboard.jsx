import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWorkspaces, createWorkspace, fetchRecentActivity, deleteWorkspace } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();

  // Get user from localStorage
  const userString = localStorage.getItem('reqgit_user');
  const user = userString ? JSON.parse(userString) : null;
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  // Create Team Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadWorkspaces();
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsActivitiesLoading(true);
    try {
      const res = await fetchRecentActivity();
      setActivities(res.activities || []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWorkspaces();
      setWorkspaces(res.workspaces || []);
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    setCreateError('');
    try {
      await createWorkspace(newTeamName);
      setNewTeamName('');
      setIsCreateModalOpen(false);
      await loadWorkspaces(); // Refresh list
    } catch (err) {
      setCreateError(err.message || "Failed to create team.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId, workspaceName) => {
    if (window.confirm(`Are you sure you want to permanently delete the workspace "${workspaceName}"?\nThis will also delete all documents and history inside it.`)) {
      try {
        await deleteWorkspace(workspaceId);
        await loadWorkspaces(); // Refresh list
      } catch (err) {
        alert("Failed to delete workspace: " + err.message);
      }
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'WS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Helper for colors
  const getColor = (name) => {
    if (!name) return 'bg-surface-variant text-on-surface-variant';
    const colors = ['bg-secondary-container text-on-secondary-container', 'bg-tertiary-container text-on-tertiary-container', 'bg-primary-container text-on-primary-container', 'bg-error-container text-on-error-container'];
    let sum = 0;
    for(let i=0; i<name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  // Helper for time ago
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <>
      <section className="flex flex-col gap-xs mb-lg">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">Welcome back, {firstName}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Here is an overview of your active workspaces and recent changes.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg items-start">
        {/* Main Column: Teams */}
        <div className="lg:col-span-3 flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">My Workspaces</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            
            {isLoading ? (
              <div className="col-span-2 py-xl flex justify-center items-center text-on-surface-variant font-body-sm">
                <span className="material-symbols-outlined animate-spin mr-sm" style={{fontSize: '20px'}}>sync</span> Loading teams...
              </div>
            ) : (
              workspaces.map((ws) => (
                <div key={ws.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:shadow-sm transition-shadow flex flex-col gap-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-sm">
                      <div className={`w-10 h-10 rounded flex items-center justify-center font-bold ${getColor(ws.name)}`}>
                        {getInitials(ws.name)}
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-semibold text-on-surface leading-tight">{ws.name}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{ws.member_count} Members</p>
                      </div>
                    </div>
                    {ws.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                        className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container/50 flex-shrink-0 ml-sm"
                        title="Delete Workspace"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                      </button>
                    )}
                  </div>
                  <button 
                    className="mt-auto w-full py-2 px-4 rounded border border-outline-variant text-on-surface font-button text-button hover:bg-surface-container-highest transition-colors"
                    onClick={() => navigate('/documents')}
                  >
                    View Workspace
                  </button>
                </div>
              ))
            )}

            {/* Create New Workspace Card */}
            <div 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-surface-container border border-dashed border-outline-variant rounded-lg p-md flex flex-col items-center justify-center gap-sm min-h-[160px] cursor-pointer hover:bg-surface-container-high transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-highest group-hover:bg-primary-container text-on-surface-variant group-hover:text-on-primary-container flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <span className="font-button text-button text-on-surface-variant group-hover:text-primary transition-colors">Create New Workspace</span>
            </div>
          </div>
        </div>

        {/* Side Column: Recent Activity */}
        <div className="lg:col-span-1 flex flex-col gap-md">
          <div className="flex items-center justify-between mb-sm">
            <h2 className="font-title-md text-title-md text-on-surface">Recent Activity</h2>
            <Link to="/activity" className="text-sm font-medium text-primary hover:text-blue-700 transition-colors hover:underline">View All</Link>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col">
            {isActivitiesLoading ? (
              <div className="py-xl flex justify-center items-center text-on-surface-variant font-body-sm">
                <span className="material-symbols-outlined animate-spin mr-sm" style={{fontSize: '20px'}}>sync</span> Loading...
              </div>
            ) : activities.length === 0 ? (
              <div className="p-md text-center text-on-surface-variant font-body-sm italic">
                No recent activity.
              </div>
            ) : (
              activities.map((act, idx) => {
                const renderActivityText = (act) => {
                  const name = act.user_name?.split(' ')[0] || 'User';
                  if (act.action_type === 'workspace_created') {
                    return <><span className="font-semibold">{name}</span> created workspace <span className="font-medium text-primary">{act.details?.workspace_name}</span></>;
                  } else if (act.action_type === 'member_added') {
                    return <><span className="font-semibold">{name}</span> added <span className="font-medium">{act.details?.member_name}</span> as {act.details?.role}</>;
                  } else if (act.action_type === 'member_removed') {
                    return <><span className="font-semibold">{name}</span> removed <span className="font-medium">{act.details?.member_name}</span></>;
                  } else if (act.action_type === 'document_uploaded') {
                    return <><span className="font-semibold">{name}</span> uploaded <span className="font-label-mono text-label-mono bg-surface-container px-1 py-0.5 rounded text-xs border border-outline-variant break-words">{act.details?.document_title}</span></>;
                  } else if (act.action_type === 'document_updated') {
                    return <><span className="font-semibold">{name}</span> updated <span className="font-label-mono text-label-mono bg-surface-container px-1 py-0.5 rounded text-xs border border-outline-variant break-words">{act.details?.document_title}</span></>;
                  }
                  return <><span className="font-semibold">{name}</span> performed an action</>;
                };

                return (
                <div key={idx} className="p-md border-b last:border-b-0 border-outline-variant flex gap-sm items-start hover:bg-surface-container-low transition-colors">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1 ${getColor(act.user_name)}`}>
                    {getInitials(act.user_name)}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                      {renderActivityText(act)}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{act.workspace_name}</p>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">{timeAgo(act.created_at)}</span>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h2 className="font-title-md text-title-md text-on-surface">Create New Workspace</h2>
              <button 
                className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container transition-colors"
                onClick={() => { setIsCreateModalOpen(false); setCreateError(''); }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              {createError && (
                <div className="p-sm rounded text-body-sm bg-error-container text-on-error-container">
                  {createError}
                </div>
              )}
              <div>
                <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Team / Workspace Name</label>
                <input 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary focus:ring-0 focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] transition-shadow placeholder:text-on-surface-variant/50" 
                  placeholder="e.g. Gamma Project" 
                  type="text" 
                  autoFocus
                />
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface flex justify-end gap-sm">
              <button 
                className="px-md py-sm rounded-lg border border-outline-variant text-on-surface font-button text-button hover:bg-surface-container transition-colors"
                onClick={() => { setIsCreateModalOpen(false); setCreateError(''); }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTeam}
                disabled={isCreating || !newTeamName.trim()}
                className="px-md py-sm rounded-lg border border-transparent bg-primary text-on-primary font-button text-button hover:bg-primary-container active:bg-[#003ea8] transition-colors shadow-sm disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
