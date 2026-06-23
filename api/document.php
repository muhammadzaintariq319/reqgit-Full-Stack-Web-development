<?php
require_once 'config.php';
require_once 'jwt.php';

// Authenticate
$token = JWT::getBearerToken();
$payload = JWT::decode($token, JWT_SECRET);

if (!$payload) {
    sendResponse(401, ["status" => "error", "message" => "Unauthorized access."]);
}

$userId = $payload['user_id'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Ensure uploads directory exists
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['workspace_id']) || !isset($_POST['title'])) {
        sendResponse(400, ["status" => "error", "message" => "Workspace ID and Title are required."]);
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        sendResponse(400, ["status" => "error", "message" => "File upload failed or no file provided."]);
    }

    $workspaceId = $_POST['workspace_id'];
    $title = trim($_POST['title']);
    $description = isset($_POST['description']) ? trim($_POST['description']) : null;
    $sharedUsersJson = isset($_POST['shared_users']) ? $_POST['shared_users'] : '[]';
    $sharedUsers = json_decode($sharedUsersJson, true);
    $file = $_FILES['file'];

    // Verify user has access to workspace
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied to this workspace."]);
    }

    // Process File
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $allowedExts = ['pdf', 'docx', 'md', 'txt'];
    if (!in_array(strtolower($ext), $allowedExts)) {
        sendResponse(400, ["status" => "error", "message" => "Invalid file format. Allowed: pdf, docx, md, txt."]);
    }

    $newFileName = uniqid('doc_') . '.' . $ext;
    $destination = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        try {
            $pdo->beginTransaction();

            // Insert document record
            $stmt = $pdo->prepare("INSERT INTO documents (workspace_id, title, description, status, created_by) VALUES (?, ?, ?, 'Draft', ?)");
            $stmt->execute([$workspaceId, $title, $description, $userId]);
            $documentId = $pdo->lastInsertId();

            // Insert initial version
            $stmt = $pdo->prepare("INSERT INTO document_versions (document_id, version_label, file_path, changes_summary, uploaded_by) VALUES (?, 'v1.0', ?, 'Initial upload', ?)");
            $stmt->execute([$documentId, $newFileName, $userId]);

            // Add document permissions
            // 1. Add creator as admin
            $stmt = $pdo->prepare("INSERT INTO document_members (document_id, user_id, role) VALUES (?, ?, 'admin')");
            $stmt->execute([$documentId, $userId]);

            // 2. Add shared users
            if (is_array($sharedUsers)) {
                $stmt = $pdo->prepare("INSERT INTO document_members (document_id, user_id, role) VALUES (?, ?, ?)");
                foreach ($sharedUsers as $su) {
                    if (isset($su['user_id']) && $su['user_id'] != $userId) {
                        $role = isset($su['role']) ? $su['role'] : 'viewer';
                        $stmt->execute([$documentId, $su['user_id'], $role]);
                    }
                }
            }

            // Log activity
            $details = json_encode(['document_title' => $title, 'version' => 'v1.0']);
            $stmtLog = $pdo->prepare("INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES (?, ?, 'document_uploaded', ?, ?)");
            $stmtLog->execute([$workspaceId, $userId, $documentId, $details]);

            $pdo->commit();

            sendResponse(201, [
                "status" => "success",
                "message" => "Document uploaded successfully.",
                "document_id" => $documentId,
                "version" => "v1.0"
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            // Clean up file if DB fails
            unlink($destination);
            sendResponse(500, ["status" => "error", "message" => "Failed to save document record."]);
        }
    } else {
        sendResponse(500, ["status" => "error", "message" => "Failed to move uploaded file."]);
    }
}
elseif ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['workspace_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Workspace ID is required."]);
    }

    $workspaceId = $_GET['workspace_id'];

    // Verify access
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied to this workspace."]);
    }

    // Fetch documents with their latest version info
    $stmt = $pdo->prepare("
        SELECT d.id, d.title, d.description, d.status, d.created_at, u.full_name as author,
               (SELECT version_label FROM document_versions WHERE document_id = d.id ORDER BY created_at DESC LIMIT 1) as current_version,
               (SELECT file_path FROM document_versions WHERE document_id = d.id ORDER BY created_at DESC LIMIT 1) as file_name
        FROM documents d
        JOIN users u ON d.created_by = u.id
        WHERE d.workspace_id = ?
        ORDER BY d.created_at DESC
    ");
    $stmt->execute([$workspaceId]);
    $documents = $stmt->fetchAll();

    sendResponse(200, ["status" => "success", "documents" => $documents]);
}
elseif ($action === 'download' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID is required."]);
    }
    $documentId = $_GET['id'];
    $versionId = isset($_GET['version_id']) ? $_GET['version_id'] : null;
    $inline = isset($_GET['inline']) && $_GET['inline'] === 'true';

    $stmt = $pdo->prepare("SELECT workspace_id FROM documents WHERE id = ?");
    $stmt->execute([$documentId]);
    $doc = $stmt->fetch();
    if (!$doc) {
        sendResponse(404, ["status" => "error", "message" => "Document not found."]);
    }
    
    $workspaceId = $doc['workspace_id'];
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied."]);
    }

    if ($versionId) {
        $stmt = $pdo->prepare("SELECT file_path, version_label FROM document_versions WHERE document_id = ? AND id = ?");
        $stmt->execute([$documentId, $versionId]);
    } else {
        $stmt = $pdo->prepare("SELECT file_path, version_label FROM document_versions WHERE document_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$documentId]);
    }
    
    $version = $stmt->fetch();
    if (!$version) {
        sendResponse(404, ["status" => "error", "message" => "Version not found."]);
    }

    $filePath = $uploadDir . $version['file_path'];
    if (!file_exists($filePath)) {
        sendResponse(404, ["status" => "error", "message" => "File not found on server."]);
    }

    $mime = mime_content_type($filePath) ?: 'application/octet-stream';
    header('Content-Type: ' . $mime);
    
    // For PDFs and Text, inline viewing is fine. Otherwise attachment.
    $originalFileName = $version['file_path'];
    $ext = strtolower(pathinfo($originalFileName, PATHINFO_EXTENSION));
    
    // Attempt to parse original name if it was prepended with doc_ id. We will just use the file_path basename.
    if ($inline && in_array($ext, ['pdf', 'txt', 'md'])) {
        header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
    } else {
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    }
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
}
elseif ($action === 'history' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID is required."]);
    }
    $documentId = $_GET['id'];

    $stmt = $pdo->prepare("SELECT workspace_id FROM documents WHERE id = ?");
    $stmt->execute([$documentId]);
    $doc = $stmt->fetch();
    if (!$doc) {
        sendResponse(404, ["status" => "error", "message" => "Document not found."]);
    }
    
    $workspaceId = $doc['workspace_id'];
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied."]);
    }

    $stmt = $pdo->prepare("
        SELECT dv.id, dv.version_label, dv.created_at, dv.changes_summary, u.full_name as uploaded_by_name
        FROM document_versions dv
        JOIN users u ON dv.uploaded_by = u.id
        WHERE dv.document_id = ?
        ORDER BY dv.created_at DESC
    ");
    $stmt->execute([$documentId]);
    $history = $stmt->fetchAll();

    sendResponse(200, ["status" => "success", "history" => $history]);
}
elseif ($action === 'members' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['document_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID is required."]);
    }
    $documentId = $_GET['document_id'];
    
    $stmt = $pdo->prepare("SELECT workspace_id FROM documents WHERE id = ?");
    $stmt->execute([$documentId]);
    $doc = $stmt->fetch();
    if (!$doc) {
        sendResponse(404, ["status" => "error", "message" => "Document not found."]);
    }
    
    $workspaceId = $doc['workspace_id'];
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied."]);
    }
    
    $stmt = $pdo->prepare("
        SELECT dm.role, dm.user_id, u.full_name, u.email 
        FROM document_members dm
        JOIN users u ON dm.user_id = u.id
        WHERE dm.document_id = ?
    ");
    $stmt->execute([$documentId]);
    $members = $stmt->fetchAll();
    
    sendResponse(200, ["status" => "success", "members" => $members]);
}
elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['document_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID is required."]);
    }
    
    $documentId = $input['document_id'];
    
    // Check permission - must be admin of the document
    $stmt = $pdo->prepare("SELECT role FROM document_members WHERE document_id = ? AND user_id = ?");
    $stmt->execute([$documentId, $userId]);
    $member = $stmt->fetch();
    
    if (!$member || $member['role'] !== 'admin') {
        sendResponse(403, ["status" => "error", "message" => "You do not have permission to delete this document."]);
    }
    
    try {
        $pdo->beginTransaction();
        
        // Find all file paths to delete physical files
        $stmt = $pdo->prepare("SELECT file_path FROM document_versions WHERE document_id = ?");
        $stmt->execute([$documentId]);
        $versions = $stmt->fetchAll();
        
        foreach ($versions as $ver) {
            $filePath = $uploadDir . $ver['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        
        // Delete records
        $pdo->prepare("DELETE FROM document_versions WHERE document_id = ?")->execute([$documentId]);
        $pdo->prepare("DELETE FROM document_members WHERE document_id = ?")->execute([$documentId]);
        $pdo->prepare("DELETE FROM documents WHERE id = ?")->execute([$documentId]);
        
        $pdo->commit();
        sendResponse(200, ["status" => "success", "message" => "Document deleted successfully."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, ["status" => "error", "message" => "Failed to delete document."]);
    }
}
elseif ($action === 'add_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['document_id']) || !isset($input['email']) || !isset($input['role'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID, Email, and Role are required."]);
    }
    
    $documentId = $input['document_id'];
    $targetEmail = trim($input['email']);
    $role = $input['role'];
    
    // Find the user by email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$targetEmail]);
    $targetUserId = $stmt->fetchColumn();
    
    if (!$targetUserId) {
        sendResponse(404, ["status" => "error", "message" => "User with this email not found."]);
    }

    // Check permission - must be admin of the document OR admin of the workspace
    $stmt = $pdo->prepare("SELECT role FROM document_members WHERE document_id = ? AND user_id = ?");
    $stmt->execute([$documentId, $userId]);
    $member = $stmt->fetch();
    
    $stmt = $pdo->prepare("SELECT workspace_id FROM documents WHERE id = ?");
    $stmt->execute([$documentId]);
    $doc = $stmt->fetch();
    $workspaceId = $doc['workspace_id'];
    
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    $wsMember = $stmt->fetch();

    if ((!$member || $member['role'] !== 'admin') && (!$wsMember || $wsMember['role'] !== 'admin')) {
        sendResponse(403, ["status" => "error", "message" => "Only document/workspace admins can add members."]);
    }
    
    // Add member
    try {
        $pdo->beginTransaction();

        // Ensure the target user is in the workspace
        $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
        $stmt->execute([$workspaceId, $targetUserId]);
        if (!$stmt->fetch()) {
            // Add them to the workspace as viewer
            $stmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'viewer')");
            $stmt->execute([$workspaceId, $targetUserId]);
            
            // Log workspace activity
            $stmtName = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
            $stmtName->execute([$targetUserId]);
            $newMemberName = $stmtName->fetchColumn();
            $details = json_encode(['member_name' => $newMemberName, 'role' => 'viewer']);
            $stmtLog = $pdo->prepare("INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES (?, ?, 'member_added', ?, ?)");
            $stmtLog->execute([$workspaceId, $userId, $targetUserId, $details]);
        }
        
        // Ensure not already a member
        $stmt = $pdo->prepare("SELECT role FROM document_members WHERE document_id = ? AND user_id = ?");
        $stmt->execute([$documentId, $targetUserId]);
        if ($stmt->fetch()) {
            $pdo->rollBack();
            sendResponse(400, ["status" => "error", "message" => "User is already a member of this document."]);
        }
        
        $stmt = $pdo->prepare("INSERT INTO document_members (document_id, user_id, role) VALUES (?, ?, ?)");
        $stmt->execute([$documentId, $targetUserId, $role]);

        $pdo->commit();
        sendResponse(201, ["status" => "success", "message" => "Member added successfully."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, ["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
}
elseif ($action === 'remove_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['document_id']) || !isset($input['user_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID and User ID are required."]);
    }
    
    $documentId = $input['document_id'];
    $targetUserId = $input['user_id'];
    
    // Check permission - must be admin of the document
    $stmt = $pdo->prepare("SELECT role FROM document_members WHERE document_id = ? AND user_id = ?");
    $stmt->execute([$documentId, $userId]);
    $member = $stmt->fetch();
    
    if (!$member || $member['role'] !== 'admin') {
        sendResponse(403, ["status" => "error", "message" => "Only document admins can remove members."]);
    }
    
    // Prevent removing yourself if you are the only admin
    if ($userId == $targetUserId) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM document_members WHERE document_id = ? AND role = 'admin'");
        $stmt->execute([$documentId]);
        $adminCount = $stmt->fetchColumn();
        if ($adminCount <= 1) {
            sendResponse(400, ["status" => "error", "message" => "Cannot remove the only admin of the document."]);
        }
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM document_members WHERE document_id = ? AND user_id = ?");
        $stmt->execute([$documentId, $targetUserId]);
        sendResponse(200, ["status" => "success", "message" => "Member removed successfully."]);
    } catch (Exception $e) {
        sendResponse(500, ["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
}

else {
    sendResponse(404, ["status" => "error", "message" => "Endpoint not found or invalid method."]);
}
?>
