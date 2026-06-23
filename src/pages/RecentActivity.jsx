import React, { useState, useEffect } from 'react';
import { fetchRecentActivity } from '../utils/api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetchRecentActivity();
      setActivities(res.activities || []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setIsLoading(false);
    }
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

  const renderCard = (act) => {
    let title = '';
    let description = '';
    let tag = '';
    let isPrimary = false;

    if (act.action_type === 'workspace_created') {
      tag = 'Workspace Created';
      title = act.details?.workspace_name || 'Workspace';
      description = `${act.user_name} created this new workspace.`;
      isPrimary = true;
    } else if (act.action_type === 'member_added') {
      tag = 'Member Added';
      title = act.workspace_name;
      description = `${act.user_name} added ${act.details?.member_name} as ${act.details?.role}.`;
    } else if (act.action_type === 'member_removed') {
      tag = 'Member Removed';
      title = act.workspace_name;
      description = `${act.user_name} removed ${act.details?.member_name}.`;
    } else if (act.action_type === 'document_uploaded') {
      tag = 'Document Uploaded';
      title = act.details?.document_title || 'Document';
      description = `${act.user_name} uploaded version ${act.details?.version}.`;
      isPrimary = true;
    } else if (act.action_type === 'document_updated') {
      tag = 'Document Updated';
      title = act.details?.document_title || 'Document';
      description = `${act.user_name} updated to version ${act.details?.version}.`;
    } else {
      tag = 'Activity';
      title = 'Unknown Action';
      description = `${act.user_name} performed an action.`;
    }

    return (
      <div className="relative" key={act.id}>
        {/* Timeline Dot */}
        <div className={`absolute -left-[35px] md:-left-[41px] top-4 w-4 h-4 rounded-full ${isPrimary ? 'bg-primary' : 'bg-outline-variant'} ring-4 ring-surface`}></div>
        
        {/* Card Content */}
        <div className={`bg-surface border ${isPrimary ? 'border-primary border-l-4' : 'border-outline-variant'} rounded-lg shadow-sm overflow-hidden`}>
          <div className="p-md flex flex-col gap-sm">
            
            {/* Card Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-sm">
              <div className="flex flex-wrap items-center gap-sm">
                <span className={`${isPrimary ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'} px-sm py-[2px] rounded font-label-mono text-label-mono`}>{tag}</span>
                <h3 className="font-title-md text-base font-semibold text-on-surface">{title}</h3>
                {act.details?.version && <span className="bg-[#bbf7d0] text-[#166534] px-xs py-[2px] rounded text-xs font-medium">{act.details.version}</span>}
              </div>
            </div>

            {/* Description */}
            <p className="font-body-sm text-on-surface">{description}</p>
            
            {/* Meta */}
            <div className="flex items-center gap-md text-on-surface-variant text-xs mt-xs">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {timeAgo(act.created_at)}
                <span className="mx-xs">&bull;</span>
                <span>{act.workspace_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Global Workspace Activity</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Track all document uploads, changes, and team activities across your workspace.</p>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="max-w-4xl pt-sm pb-xl">
        <div className="relative pl-6 md:pl-8 border-l-2 border-outline-variant ml-3 md:ml-4 flex flex-col gap-xl">
          {isLoading ? (
            <div className="py-xl flex justify-center items-center text-on-surface-variant font-body-sm">
              <span className="material-symbols-outlined animate-spin mr-sm" style={{fontSize: '20px'}}>sync</span> Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-xl flex justify-center items-center text-on-surface-variant font-body-sm italic">
              No recent activity recorded yet.
            </div>
          ) : (
            activities.map(renderCard)
          )}
        </div>
      </div>
    </>
  );
};

export default RecentActivity;
