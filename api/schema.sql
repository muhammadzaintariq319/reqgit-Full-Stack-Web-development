-- ====================================================================
-- ReqGit MySQL Database Schema
-- Optimized for InnoDB with Full Relational Constraints
-- ====================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS reqgit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reqgit_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Workspaces (Teams) Table
CREATE TABLE IF NOT EXISTS workspaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_workspaces_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Workspace Members Table (Junction Table)
CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id),
    CONSTRAINT fk_wm_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_wm_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('Draft', 'Approved', 'Deprecated') DEFAULT 'Draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_docs_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_docs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Document Versions Table (Version Control Engine)
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    version_label VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    changes_summary TEXT DEFAULT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dv_document_id FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_dv_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Document Members Table (Document-level Sharing)
CREATE TABLE IF NOT EXISTS document_members (
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, user_id),
    CONSTRAINT fk_dm_document_id FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_dm_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    user_id INT NOT NULL,
    action_type ENUM('workspace_created', 'member_added', 'member_removed', 'document_uploaded', 'document_updated') NOT NULL,
    entity_id INT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_al_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- Dummy Data Injection for Immediate Testing
-- ====================================================================

-- Insert Users
-- Passwords are hashed versions of 'password123'
INSERT INTO users (id, full_name, email, password_hash) VALUES 
(1, 'Alice Engineer', 'alice@reqgit.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, 'Bob Reviewer', 'bob@reqgit.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert Workspace
INSERT INTO workspaces (id, name, created_by) VALUES 
(1, 'Project Alpha Reqs', 1);

-- Assign Members to Workspace
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES 
(1, 1, 'admin'),
(1, 2, 'editor');

-- Insert Document
INSERT INTO documents (id, workspace_id, title, status, created_by) VALUES 
(1, 1, 'Authentication API Spec', 'Draft', 1);

-- Insert Document Versions
INSERT INTO document_versions (id, document_id, version_label, file_path, changes_summary, uploaded_by) VALUES 
(1, 1, 'v1.0', 'auth-spec-v1.docx', 'Initial draft of auth endpoints', 1),
(2, 1, 'v1.1', 'auth-spec-v1.1.docx', 'Added JWT refresh token logic', 2);

-- Insert Activity Logs
INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES 
(1, 1, 'workspace_created', 1, '{"workspace_name":"Project Alpha Reqs"}'),
(1, 1, 'member_added', 2, '{"member_name":"Bob Reviewer", "role":"editor"}'),
(1, 1, 'document_uploaded', 1, '{"document_title":"Authentication API Spec", "version":"v1.0"}'),
(1, 2, 'document_updated', 1, '{"document_title":"Authentication API Spec", "version":"v1.1"}');
