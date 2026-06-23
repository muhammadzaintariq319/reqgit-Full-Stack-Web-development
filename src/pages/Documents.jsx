import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, fetchDocuments, fetchWorkspaces, createWorkspace, fetchWorkspaceMembers, addWorkspaceMember, fetchDocumentHistory, getDownloadUrl, deleteDocument, fetchDocumentSharedMembers, addDocumentMember, removeDocumentMember } from '../utils/api';

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Sharing State
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [sharedUsers, setSharedUsers] = useState({}); // { user_id: role }
  
  // Add Member State
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberMsg, setAddMemberMsg] = useState({ text: '', type: '' });
  
  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [activeHistoryDoc, setActiveHistoryDoc] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Details & Delete State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeDetailsDoc, setActiveDetailsDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsMembers, setDetailsMembers] = useState([]);
  const [isDetailsMembersLoading, setIsDetailsMembersLoading] = useState(false);
  const [addDocMemberEmail, setAddDocMemberEmail] = useState('');
  const [addDocMemberRole, setAddDocMemberRole] = useState('viewer');
  const [isAddingDocMember, setIsAddingDocMember] = useState(false);
  const [docMemberMsg, setDocMemberMsg] = useState({ text: '', type: '' });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    setIsLoading(true);
    try {
      const wsResponse = await fetchWorkspaces();
      let activeWsId = null;

      if (wsResponse.workspaces && wsResponse.workspaces.length > 0) {
        activeWsId = wsResponse.workspaces[0].id;
      } else {
        const createRes = await createWorkspace("My Personal Workspace");
        activeWsId = createRes.workspace.id;
      }

      setCurrentWorkspaceId(activeWsId);
      await loadDocuments(activeWsId);
    } catch (err) {
      console.warn("API Error:", err.message);
      setError("Failed to initialize workspace. " + err.message);
      setIsLoading(false);
    }
  };

  const loadDocuments = async (workspaceId) => {
    try {
      const response = await fetchDocuments(workspaceId);
      
      const formattedDocs = response.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.file_name,
        version: doc.current_version,
        status: doc.status,
        author: doc.author,
        modified: new Date(doc.created_at).toLocaleDateString(),
        iconBg: 'bg-primary-fixed',
        iconColor: 'text-on-primary-fixed-variant',
        iconName: 'article',
        badgeColor: doc.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
      }));
      
      setDocuments(formattedDocs);
    } catch (err) {
      setError("Failed to load documents from database. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const loadMembers = async (workspaceId) => {
    try {
      const membersRes = await fetchWorkspaceMembers(workspaceId);
      const currentUserString = localStorage.getItem('reqgit_user');
      const currentUser = currentUserString ? JSON.parse(currentUserString) : null;
      
      const otherMembers = membersRes.members.filter(m => currentUser && m.id !== currentUser.id);
      setWorkspaceMembers(otherMembers);
    } catch (err) {
      console.warn("Could not fetch members", err);
      setWorkspaceMembers([]);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentWorkspaceId) return;

    setSelectedFile(file);
    setUploadTitle(file.name.split('.')[0] || 'New Document');
    setUploadDesc('');
    setSharedUsers({});
    setNewMemberEmail('');
    setAddMemberMsg({ text: '', type: '' });
    
    await loadMembers(currentWorkspaceId);

    setIsModalOpen(true);
    e.target.value = ''; // Reset input
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    setIsAddingMember(true);
    setAddMemberMsg({ text: '', type: '' });
    
    try {
      await addWorkspaceMember(currentWorkspaceId, newMemberEmail, newMemberRole);
      setAddMemberMsg({ text: 'Member added successfully!', type: 'success' });
      setNewMemberEmail('');
      // Refresh the members list
      await loadMembers(currentWorkspaceId);
    } catch (err) {
      setAddMemberMsg({ text: err.message || 'Failed to add member.', type: 'error' });
    } finally {
      setIsAddingMember(false);
    }
  };

  const toggleShareUser = (userId) => {
    setSharedUsers(prev => {
      const next = { ...prev };
      if (next[userId]) {
        delete next[userId]; // uncheck
      } else {
        next[userId] = 'viewer'; // default role
      }
      return next;
    });
  };

  const updateShareRole = (userId, role) => {
    setSharedUsers(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const confirmUpload = async () => {
    if (!selectedFile || !currentWorkspaceId || !uploadTitle.trim()) {
      alert("Title is required.");
      return;
    }

    setIsUploading(true);
    try {
      // Format shared users
      const formattedSharedUsers = Object.entries(sharedUsers).map(([userId, role]) => ({
        user_id: parseInt(userId, 10),
        role: role
      }));

      await uploadDocument(currentWorkspaceId, uploadTitle, selectedFile, uploadDesc, formattedSharedUsers);
      
      // Close modal and reload
      setIsModalOpen(false);
      setSelectedFile(null);
      await loadDocuments(currentWorkspaceId);
      
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (docId) => {
    const url = getDownloadUrl(docId, null, true);
    window.open(url, '_blank');
  };

  const handleDownload = (docId, versionId = null) => {
    const url = getDownloadUrl(docId, versionId, false);
    window.location.href = url;
  };

  const openHistory = async (doc) => {
    setActiveHistoryDoc(doc);
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    try {
      const response = await fetchDocumentHistory(doc.id);
      setHistoryData(response.history || []);
    } catch (err) {
      alert("Failed to load history: " + err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openDetails = async (doc) => {
    setActiveDetailsDoc(doc);
    setIsDetailsOpen(true);
    setDetailsMembers([]);
    setIsDetailsMembersLoading(true);
    setDocMemberMsg({ text: '', type: '' });
    
    // Load workspace members if empty
    if (workspaceMembers.length === 0 && currentWorkspaceId) {
      await loadMembers(currentWorkspaceId);
    }
    
    await refreshDetailsMembers(doc.id);
  };

  const refreshDetailsMembers = async (docId) => {
    setIsDetailsMembersLoading(true);
    try {
      const response = await fetchDocumentSharedMembers(docId);
      setDetailsMembers(response.members || []);
    } catch (err) {
      console.warn("Failed to load members:", err);
    } finally {
      setIsDetailsMembersLoading(false);
    }
  };

  const handleAddDocMember = async () => {
    if (!addDocMemberEmail || !activeDetailsDoc) return;
    setIsAddingDocMember(true);
    setDocMemberMsg({ text: '', type: '' });
    try {
      await addDocumentMember(activeDetailsDoc.id, addDocMemberEmail, addDocMemberRole);
      setDocMemberMsg({ text: 'Member added successfully.', type: 'success' });
      setAddDocMemberEmail('');
      await refreshDetailsMembers(activeDetailsDoc.id);
    } catch (err) {
      setDocMemberMsg({ text: err.message, type: 'error' });
    } finally {
      setIsAddingDocMember(false);
    }
  };

  const handleRemoveDocMember = async (userId, userName) => {
    if (!activeDetailsDoc) return;
    if (window.confirm(`Are you sure you want to remove ${userName} from this document?`)) {
      try {
        await removeDocumentMember(activeDetailsDoc.id, userId);
        await refreshDetailsMembers(activeDetailsDoc.id);
      } catch (err) {
        alert("Failed to remove member: " + err.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!activeDetailsDoc) return;
    
    if (window.confirm(`Are you sure you want to permanently delete "${activeDetailsDoc.title}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteDocument(activeDetailsDoc.id);
        setIsDetailsOpen(false);
        setActiveDetailsDoc(null);
        await loadDocuments(currentWorkspaceId);
      } catch (err) {
        alert("Failed to delete document: " + err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      {/* Hidden File Input */}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept=".pdf,.docx,.md,.txt"
      />

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-xl">
              <h2 className="text-title-lg font-title-lg text-on-surface">Upload Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg overflow-y-auto flex-1 flex flex-col gap-md">
              <div className="bg-surface-container-low p-md rounded flex items-center gap-md border border-outline-variant">
                <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded flex items-center justify-center">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{selectedFile?.name}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{(selectedFile?.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              <div>
                <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Project / Document Name *</label>
                <input 
                  type="text" 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-body-md font-body-md outline-none"
                  placeholder="e.g. Authentication Module SRS"
                  required
                />
              </div>

              <div>
                <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Details / Description</label>
                <textarea 
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-body-md font-body-md outline-none min-h-[100px] resize-y"
                  placeholder="Briefly describe what this document covers..."
                />
              </div>

              <div>
                <label className="block font-label-mono text-label-mono text-on-surface mb-sm">Share with Team Members</label>
                
                {/* Add New Member Section */}
                <div className="flex gap-sm mb-md items-start">
                  <div className="flex-1">
                    <input 
                      type="email" 
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Add new member via email..."
                      className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-body-sm font-body-sm outline-none"
                    />
                    {addMemberMsg.text && (
                      <div className={`mt-1 text-xs font-medium ${addMemberMsg.type === 'error' ? 'text-error' : 'text-green-600'}`}>
                        {addMemberMsg.text}
                      </div>
                    )}
                  </div>
                  <select 
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="p-sm border border-outline-variant rounded bg-surface text-body-sm font-body-sm outline-none focus:border-primary w-32"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    onClick={handleAddMember}
                    disabled={isAddingMember || !newMemberEmail.trim()}
                    className="px-md py-sm bg-surface-container-high hover:bg-surface-variant text-on-surface font-button text-button rounded transition-colors disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                  >
                    {isAddingMember ? 'Adding...' : 'Invite'}
                  </button>
                </div>

                {workspaceMembers.length === 0 ? (
                  <div className="text-body-sm text-on-surface-variant italic p-sm bg-surface-container-lowest border border-outline-variant rounded">No other members in this workspace yet.</div>
                ) : (
                  <div className="border border-outline-variant rounded bg-surface-container-lowest flex flex-col divide-y divide-outline-variant max-h-[200px] overflow-y-auto">
                    {workspaceMembers.map(member => (
                      <div key={member.id} className="p-sm flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <label className="flex items-center gap-md cursor-pointer flex-1">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-primary rounded border-outline focus:ring-primary"
                            checked={!!sharedUsers[member.id]}
                            onChange={() => toggleShareUser(member.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md font-medium text-on-surface">{member.full_name}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{member.email}</span>
                          </div>
                        </label>
                        
                        {sharedUsers[member.id] && (
                          <select 
                            value={sharedUsers[member.id]}
                            onChange={(e) => updateShareRole(member.id, e.target.value)}
                            className="ml-md p-1 border border-outline-variant rounded bg-surface text-body-sm font-body-sm outline-none focus:border-primary"
                          >
                            <option value="viewer">Can View</option>
                            <option value="editor">Can Edit</option>
                            <option value="admin">Full Settings</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-lg border-t border-outline-variant flex justify-end gap-md bg-surface-container-lowest rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-md py-sm rounded font-button text-button text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpload}
                disabled={isUploading || !uploadTitle.trim()}
                className="px-md py-sm rounded font-button text-button bg-primary text-on-primary hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-xs"
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{fontSize: '18px'}}>sync</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>upload</span>
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-xl">
              <div>
                <h2 className="text-title-lg font-title-lg text-on-surface">Version History</h2>
                <p className="text-body-sm text-on-surface-variant mt-xs">Document: {activeHistoryDoc?.title}</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg overflow-y-auto flex-1 bg-surface-container-lowest">
              {isHistoryLoading ? (
                <div className="flex justify-center items-center py-xl text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin mr-sm">sync</span> Loading history...
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant">No history found.</div>
              ) : (
                <div className="relative border-l-2 border-outline-variant ml-4 space-y-lg pb-md">
                  {historyData.map((ver, idx) => (
                    <div key={ver.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
                      <div className="bg-surface border border-outline-variant rounded-lg p-md shadow-sm">
                        <div className="flex justify-between items-start mb-sm">
                          <div className="flex items-center gap-sm">
                            <span className="px-2 py-1 bg-primary-container text-on-primary-container text-[12px] font-bold rounded">
                              {ver.version_label}
                            </span>
                            <span className="text-body-sm font-medium text-on-surface">{ver.uploaded_by_name}</span>
                          </div>
                          <button 
                            onClick={() => handleDownload(activeHistoryDoc.id, ver.id)}
                            className="text-primary hover:text-blue-700 hover:bg-primary-fixed p-1 rounded transition-colors flex items-center gap-xs text-[12px] font-medium"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> Download
                          </button>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mb-xs">
                          {ver.changes_summary || "No description provided."}
                        </p>
                        <p className="text-[12px] text-on-surface-variant font-label-mono">
                          {new Date(ver.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && activeDetailsDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
          <div className="bg-surface w-full max-w-lg rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-xl">
              <h2 className="text-title-lg font-title-lg text-on-surface flex items-center gap-sm">
                <span className={`material-symbols-outlined ${activeDetailsDoc.iconColor}`}>{activeDetailsDoc.iconName}</span>
                Document Details
              </h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg flex flex-col gap-md bg-surface-container-lowest overflow-y-auto flex-1">
              <div>
                <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Title</label>
                <div className="text-body-lg font-body-lg text-on-surface font-medium">{activeDetailsDoc.title}</div>
              </div>
              
              <div>
                <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">File Name</label>
                <div className="text-body-md font-body-md text-on-surface font-mono">{activeDetailsDoc.filename}</div>
              </div>

              <div>
                <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Description</label>
                <div className="text-body-md font-body-md text-on-surface bg-surface-container-low p-sm rounded border border-outline-variant min-h-[80px]">
                  {activeDetailsDoc.description || <span className="text-on-surface-variant italic">No description provided.</span>}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Author</label>
                  <div className="text-body-md font-body-md text-on-surface">{activeDetailsDoc.author}</div>
                </div>
                <div>
                  <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Created / Uploaded</label>
                  <div className="text-body-md font-body-md text-on-surface">{activeDetailsDoc.modified}</div>
                </div>
                <div>
                  <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Version</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-semibold border ${activeDetailsDoc.badgeColor}`}>
                    {activeDetailsDoc.version}
                  </span>
                </div>
              </div>

              <div className="mt-xs">
                <label className="text-label-mono font-label-mono text-on-surface-variant mb-xs block">Manage Members</label>
                
                {/* Add Member Form */}
                <div className="flex gap-sm mb-sm items-start">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={addDocMemberEmail}
                      onChange={(e) => setAddDocMemberEmail(e.target.value)}
                      className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-body-sm font-body-sm outline-none focus:border-primary placeholder:text-on-surface-variant/50"
                    />
                    {docMemberMsg.text && (
                      <div className={`mt-1 text-xs font-medium ${docMemberMsg.type === 'error' ? 'text-error' : 'text-green-600'}`}>
                        {docMemberMsg.text}
                      </div>
                    )}
                  </div>
                  <select 
                    value={addDocMemberRole}
                    onChange={(e) => setAddDocMemberRole(e.target.value)}
                    className="p-sm border border-outline-variant rounded bg-surface-container-lowest text-body-sm font-body-sm outline-none focus:border-primary w-28"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    onClick={handleAddDocMember}
                    disabled={isAddingDocMember || !addDocMemberEmail}
                    className="px-md py-sm bg-primary text-on-primary font-button text-button rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isAddingDocMember ? 'Adding...' : 'Add'}
                  </button>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded p-sm max-h-[150px] overflow-y-auto">
                  {isDetailsMembersLoading ? (
                    <div className="flex items-center justify-center py-md text-on-surface-variant text-body-sm">
                      <span className="material-symbols-outlined animate-spin mr-xs" style={{fontSize: '16px'}}>sync</span> Loading...
                    </div>
                  ) : detailsMembers.length === 0 ? (
                    <div className="text-body-sm text-on-surface-variant italic py-xs">Not shared with anyone.</div>
                  ) : (
                    <ul className="divide-y divide-outline-variant">
                      {detailsMembers.map((member, idx) => (
                        <li key={idx} className="py-xs flex justify-between items-center group">
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{member.full_name}</span>
                            <span className="text-[12px] text-on-surface-variant">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${member.role === 'admin' ? 'bg-error-container text-on-error-container' : member.role === 'editor' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                              {member.role}
                            </span>
                            <button
                              onClick={() => handleRemoveDocMember(member.user_id, member.full_name)}
                              className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove member"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_remove</span>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-lg border-t border-outline-variant flex justify-between gap-md bg-surface-container-lowest rounded-b-xl">
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-md py-sm rounded font-button text-button text-error hover:bg-error-container transition-colors flex items-center gap-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin" style={{fontSize: '18px'}}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>delete</span>
                )}
                Delete Document
              </button>
              
              <div className="flex gap-md">
                <button 
                  onClick={() => handleView(activeDetailsDoc.id)}
                  className="px-md py-sm rounded font-button text-button text-on-surface border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  View
                </button>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-md py-sm rounded font-button text-button bg-primary text-on-primary hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-xl gap-md">
        <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-background">Project Documents</h1>
        <button 
          onClick={triggerFileUpload}
          disabled={isLoading || !currentWorkspaceId}
          className="bg-primary text-on-primary font-button text-button py-sm px-md rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
          Upload New Document
        </button>
      </div>

      {error && (
        <div className="mb-md p-sm bg-error-container text-on-error-container text-body-sm font-body-sm rounded">
          {error}
        </div>
      )}

      {/* Upload Zone */}
      <div 
        onClick={triggerFileUpload}
        className={`mb-xl border-2 border-dashed border-outline-variant rounded-xl bg-surface p-xl flex flex-col items-center justify-center text-center transition-colors ${!isLoading && currentWorkspaceId ? 'hover:border-primary hover:bg-surface-container-low cursor-pointer group' : 'opacity-70 cursor-not-allowed'}`}
      >
        <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
          <span className="material-symbols-outlined text-outline group-hover:text-on-primary-container transition-colors" style={{ fontSize: '32px' }}>cloud_upload</span>
        </div>
        <h3 className="text-title-md font-title-md mb-xs">Drag and drop your SRS files here</h3>
        <p className="text-body-sm font-body-sm text-on-surface-variant mb-md">Supports .docx, .pdf, .md up to 50MB</p>
        <div className="text-button font-button text-primary">Or click to browse</div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="text-center py-xl text-on-surface-variant font-body-sm">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant font-body-sm">No documents found. Upload your first SRS file above!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-surface border border-outline-variant rounded-lg p-md flex flex-col hover:shadow-sm transition-shadow">
              <div 
                className="flex justify-between items-start mb-md pb-sm border-b border-surface-container-lowest cursor-pointer group"
                onClick={() => openDetails(doc)}
              >
                <div className="flex items-center gap-sm">
                  <div className={`p-xs rounded ${doc.iconBg} group-hover:ring-2 ring-primary transition-all`}>
                    <span className={`material-symbols-outlined ${doc.iconColor}`}>{doc.iconName}</span>
                  </div>
                  <div>
                    <h4 className="text-title-md font-title-md text-on-background leading-tight truncate max-w-[150px] group-hover:text-primary transition-colors">{doc.title}</h4>
                    <div className="text-[12px] text-on-surface-variant font-label-mono mt-xs truncate max-w-[150px]" title={doc.filename}>{doc.filename}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-[12px] font-semibold border ${doc.badgeColor}`}>
                  {doc.version}
                </span>
              </div>
              <div className="flex-1 mb-md">
                <div className="flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant mb-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  {doc.author}
                </div>
                <div className="flex items-center gap-xs text-body-sm font-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                  Modified {doc.modified}
                </div>
              </div>
              <div className="flex gap-sm mt-auto pt-sm border-t border-surface-container">
                <button onClick={() => handleView(doc.id)} className="flex-1 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low font-button text-button py-xs rounded flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span> View
                </button>
                <button onClick={() => handleDownload(doc.id)} className="flex-1 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low font-button text-button py-xs rounded flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> Download
                </button>
                <button onClick={() => navigate('/documents/history', { state: { document: doc } })} className="flex-1 bg-surface text-primary border border-primary hover:bg-primary-fixed font-button text-button py-xs rounded flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span> History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Documents;
