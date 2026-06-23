// src/utils/api.js
// Utility wrapper for fetch to automatically handle Authorization tokens and Base URL

// Update this URL to point to your local PHP server (e.g., XAMPP/WAMP) where the api/ folder is hosted.
// If you are using XAMPP and placed the project in htdocs/reqgit, it might be http://localhost/reqgit/api
export const API_BASE_URL = 'http://localhost:8000'; 

/**
 * Perform an API request
 * @param {string} endpoint - The API endpoint (e.g., 'auth.php?action=login')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('reqgit_token');
  
  const headers = {
    ...options.headers,
  };

  // Attach token if exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If we are sending JSON and not FormData, set Content-Type
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const loginUser = async (email, password) => {
  return apiRequest('auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (fullName, email, password) => {
  return apiRequest('auth.php?action=register', {
    method: 'POST',
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
};

export const fetchWorkspaces = async () => {
  return apiRequest('workspace.php?action=list', {
    method: 'GET',
  });
};

export const createWorkspace = async (name) => {
  return apiRequest('workspace.php?action=create', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const deleteWorkspace = async (workspaceId) => {
  return apiRequest('workspace.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId }),
  });
};

export const fetchWorkspaceMembers = async (workspaceId) => {
  return apiRequest(`workspace.php?action=members&workspace_id=${workspaceId}`, {
    method: 'GET',
  });
};

export const addWorkspaceMember = async (workspaceId, email, role) => {
  return apiRequest('workspace.php?action=add_member', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId, email, role }),
  });
};

export const removeWorkspaceMember = async (workspaceId, userId) => {
  return apiRequest('workspace.php?action=remove_member', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId, user_id: userId }),
  });
};

export const fetchRecentActivity = async () => {
  return apiRequest('workspace.php?action=recent_activity', {
    method: 'GET',
  });
};

export const uploadDocument = async (workspaceId, title, file, description = '', sharedUsers = []) => {
  const formData = new FormData();
  formData.append('workspace_id', workspaceId);
  formData.append('title', title);
  if (description) {
    formData.append('description', description);
  }
  if (sharedUsers.length > 0) {
    formData.append('shared_users', JSON.stringify(sharedUsers));
  }
  formData.append('file', file);

  // Note: When using FormData, do NOT set Content-Type manually. 
  // Fetch will automatically set it to multipart/form-data with the correct boundary.
  return apiRequest('document.php?action=upload', {
    method: 'POST',
    body: formData,
  });
};

export const fetchDocuments = async (workspaceId) => {
  return apiRequest(`document.php?action=list&workspace_id=${workspaceId}`, {
    method: 'GET',
  });
};

export const fetchDocumentHistory = async (documentId) => {
  return apiRequest(`document.php?action=history&id=${documentId}`, {
    method: 'GET',
  });
};

export const getDownloadUrl = (documentId, versionId = null, inline = false) => {
  const token = localStorage.getItem('reqgit_token');
  let url = `${API_BASE_URL}/document.php?action=download&id=${documentId}&token=${token}`;
  if (versionId) url += `&version_id=${versionId}`;
  if (inline) url += `&inline=true`;
  return url;
};

export const deleteDocument = async (documentId) => {
  return apiRequest('document.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ document_id: documentId }),
  });
};

export const getDocumentVersions = async (documentId) => {
  return apiRequest(`document.php?action=get_versions&document_id=${documentId}`, {
    method: 'GET',
  });
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profile_pic', file);
  
  const token = localStorage.getItem('reqgit_token');
  const response = await fetch(`${API_BASE_URL}/user.php?action=upload_profile_pic`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload profile picture');
  }
  return data;
};

export const removeProfilePicture = async () => {
  return apiRequest('user.php?action=remove_profile_pic', {
    method: 'POST',
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  return apiRequest('user.php?action=change_password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
};

export const updateProfile = async (fullName, email) => {
  return apiRequest('user.php?action=update_profile', {
    method: 'POST',
    body: JSON.stringify({ full_name: fullName, email }),
  });
};

export const fetchDocumentSharedMembers = async (documentId) => {
  return apiRequest(`document.php?action=members&document_id=${documentId}`, {
    method: 'GET',
  });
};

export const addDocumentMember = async (documentId, email, role) => {
  return apiRequest('document.php?action=add_member', {
    method: 'POST',
    body: JSON.stringify({ document_id: documentId, email: email, role }),
  });
};

export const removeDocumentMember = async (documentId, userId) => {
  return apiRequest('document.php?action=remove_member', {
    method: 'POST',
    body: JSON.stringify({ document_id: documentId, user_id: userId }),
  });
};
