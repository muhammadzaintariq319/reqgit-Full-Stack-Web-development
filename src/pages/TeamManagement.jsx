import React, { useState, useEffect, useMemo } from 'react';
import { fetchWorkspaces, fetchWorkspaceMembers, addWorkspaceMember, removeWorkspaceMember } from '../utils/api';

const TeamManagement = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState('ALL');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ text: '', type: '' });
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const wsRes = await fetchWorkspaces();
      const loadedWorkspaces = wsRes.workspaces || [];
      
      // Fetch members for each workspace
      const workspacesWithMembers = await Promise.all(loadedWorkspaces.map(async (ws) => {
        try {
          const mRes = await fetchWorkspaceMembers(ws.id);
          return { ...ws, members: mRes.members || [] };
        } catch (e) {
          return { ...ws, members: [] };
        }
      }));
      
      setWorkspaces(workspacesWithMembers);
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteWorkspaceId) return;
    setIsInviting(true);
    setInviteMsg({ text: '', type: '' });
    try {
      if (inviteWorkspaceId === 'ALL') {
        const adminWorkspaces = workspaces.filter(ws => ws.role === 'admin');
        const invitePromises = adminWorkspaces.map(ws => 
          addWorkspaceMember(ws.id, inviteEmail, inviteRole)
            .catch(err => {
              if (!err.message.includes('already a member') && !err.message.includes('already exists')) {
                throw new Error(`Failed for ${ws.name}: ${err.message}`);
              }
            })
        );
        await Promise.all(invitePromises);
        setInviteMsg({ text: 'Member invited to selected projects successfully.', type: 'success' });
      } else {
        await addWorkspaceMember(inviteWorkspaceId, inviteEmail, inviteRole);
        setInviteMsg({ text: 'Member invited successfully.', type: 'success' });
      }
      setInviteEmail('');
      await loadInitialData();
    } catch (err) {
      setInviteMsg({ text: err.message, type: 'error' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName, memberWorkspaces) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from all projects you manage?`)) {
      try {
        const adminWorkspaceIds = workspaces.filter(ws => ws.role === 'admin').map(ws => ws.id);
        const workspacesToRemove = memberWorkspaces.filter(id => adminWorkspaceIds.includes(id));
        
        await Promise.all(workspacesToRemove.map(wsId => removeWorkspaceMember(wsId, memberId)));
        await loadInitialData();
      } catch (err) {
        alert("Failed to remove member: " + err.message);
      }
    }
  };

  const openInviteModal = () => {
    setInviteMsg({ text: '', type: '' });
    setInviteEmail('');
    setInviteRole('viewer');
    setInviteWorkspaceId('ALL');
    setIsInviteModalOpen(true);
  };

  // Helper to generate initials from full name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  // Choose color based on initials sum
  const getAvatarColor = (name) => {
    if (!name) return 'bg-surface-variant text-on-surface-variant';
    const colors = ['bg-primary-container text-on-primary-container', 'bg-secondary-fixed text-on-secondary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-error-container text-on-error-container'];
    let sum = 0;
    for(let i=0; i<name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  // Derive flat list of unique members
  const flatMembers = useMemo(() => {
    const memberMap = new Map();
    workspaces.forEach(ws => {
      ws.members.forEach(m => {
        if (!memberMap.has(m.id)) {
          memberMap.set(m.id, {
            ...m,
            roles: new Set([m.role]),
            workspaces: [ws.id]
          });
        } else {
          const existing = memberMap.get(m.id);
          existing.roles.add(m.role);
          existing.workspaces.push(ws.id);
        }
      });
    });
    
    return Array.from(memberMap.values()).map(m => ({
      ...m,
      displayRole: m.roles.size === 1 ? Array.from(m.roles)[0] : 'MIXED'
    })).sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));
  }, [workspaces]);

  const adminWorkspaces = workspaces.filter(ws => ws.role === 'admin');

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md border-b border-outline-variant pb-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Team Management
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Manage all members across your projects in one place.</p>
        </div>
        {adminWorkspaces.length > 0 && (
          <button 
            className="bg-primary text-on-primary font-button text-button py-sm px-md rounded-lg hover:bg-primary-container active:bg-[#003ea8] transition-colors border border-transparent shadow-sm flex items-center gap-xs"
            onClick={openInviteModal}
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            Invite Member
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-xl flex justify-center items-center text-on-surface-variant font-body-sm">
          <span className="material-symbols-outlined animate-spin mr-sm" style={{fontSize: '20px'}}>sync</span> Loading team...
        </div>
      ) : flatMembers.length === 0 ? (
        <div className="py-xl flex justify-center items-center text-on-surface-variant font-body-sm italic">
          No members found across any projects.
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface">
                  <th className="py-sm px-md font-body-sm text-body-sm text-on-surface-variant font-semibold w-1/2">Member</th>
                  <th className="py-sm px-md font-body-sm text-body-sm text-on-surface-variant font-semibold">Role</th>
                  <th className="py-sm px-md font-body-sm text-body-sm text-on-surface-variant font-semibold">Joined At</th>
                  <th className="py-sm px-md font-body-sm text-body-sm text-on-surface-variant font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {flatMembers.map(member => {
                  // Can the user remove this member? Only if the member is part of at least one project where the user is an admin.
                  const canRemove = member.workspaces.some(wsId => adminWorkspaces.some(aw => aw.id === wsId));

                  return (
                    <tr key={member.id} className="hover:bg-surface-container transition-colors group">
                      <td className="py-md px-md">
                        <div className="flex items-center gap-md">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border border-outline-variant text-[14px] ${getAvatarColor(member.full_name)}`}>
                            {getInitials(member.full_name)}
                          </div>
                          <div>
                            <div className="font-body-sm text-body-sm font-medium text-on-surface">{member.full_name}</div>
                            <div className="font-label-mono text-label-mono text-on-surface-variant">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-md px-md">
                        <span className={`inline-flex items-center px-xs py-[2px] rounded-DEFAULT font-label-mono text-[11px] uppercase tracking-wider border ${
                          member.displayRole === 'admin' ? 'bg-primary-container/10 text-primary border-primary-container/20' : 
                          member.displayRole === 'MIXED' ? 'bg-secondary-container/10 text-secondary border-secondary-container/20' :
                          'bg-surface-variant text-on-surface-variant border-outline-variant'
                        }`}>
                          {member.displayRole}
                        </span>
                      </td>
                      <td className="py-md px-md font-body-sm text-body-sm text-on-surface-variant">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="py-md px-md text-right">
                        {canRemove && (
                          <button 
                            onClick={() => handleRemoveMember(member.id, member.full_name, member.workspaces)}
                            className="text-on-surface-variant hover:text-error transition-colors p-xs rounded-full hover:bg-error-container/50 opacity-0 group-hover:opacity-100" 
                            title="Remove Member from managed projects"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal Overlay */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface">
              <h2 className="font-title-md text-title-md text-on-surface">
                Invite Member
              </h2>
              <button 
                className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container transition-colors"
                onClick={() => { setIsInviteModalOpen(false); setInviteMsg({text:'', type:''}); }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              {inviteMsg.text && (
                <div className={`p-sm rounded text-body-sm ${inviteMsg.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
                  {inviteMsg.text}
                </div>
              )}
              <div>
                <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Email Address</label>
                <input 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary focus:ring-0 focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] transition-shadow placeholder:text-on-surface-variant/50" 
                  placeholder="colleague@company.com" 
                  type="email" 
                />
              </div>

              <div>
                <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Role</label>
                <div className="relative">
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary focus:ring-0 focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] transition-shadow appearance-none bg-surface-container-lowest text-on-surface"
                  >
                    <option value="viewer">Viewer - Read only access</option>
                    <option value="editor">Editor - Can modify documents</option>
                    <option value="admin">Admin - Full access including billing</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface flex justify-end gap-sm">
              <button 
                className="px-md py-sm rounded-lg border border-outline-variant text-on-surface font-button text-button hover:bg-surface-container transition-colors"
                onClick={() => { setIsInviteModalOpen(false); setInviteMsg({text:'', type:''}); }}
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
                className="px-md py-sm rounded-lg border border-transparent bg-primary text-on-primary font-button text-button hover:bg-primary-container active:bg-[#003ea8] transition-colors shadow-sm disabled:opacity-50"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamManagement;
