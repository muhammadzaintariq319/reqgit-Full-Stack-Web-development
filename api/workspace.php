<?php
require_once 'config.php';
require_once 'jwt.php';

// All workspace routes require authentication
$token = JWT::getBearerToken();
$payload = JWT::decode($token, JWT_SECRET);

if (!$payload) {
    sendResponse(401, ["status" => "error", "message" => "Unauthorized access."]);
}

$userId = $payload['user_id'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Read JSON input for POST/PUT
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['name'])) {
        sendResponse(400, ["status" => "error", "message" => "Workspace name is required."]);
    }

    $name = trim($input['name']);

    try {
        $pdo->beginTransaction();

        // Insert workspace
        $stmt = $pdo->prepare("INSERT INTO workspaces (name, created_by) VALUES (?, ?)");
        $stmt->execute([$name, $userId]);
        $workspaceId = $pdo->lastInsertId();

        // Add creator as admin
        $stmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'admin')");
        $stmt->execute([$workspaceId, $userId]);

        // Log activity
        $details = json_encode(['workspace_name' => $name]);
        $stmt = $pdo->prepare("INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES (?, ?, 'workspace_created', ?, ?)");
        $stmt->execute([$workspaceId, $userId, $workspaceId, $details]);

        $pdo->commit();

        sendResponse(201, [
            "status" => "success",
            "message" => "Workspace created successfully.",
            "workspace" => [
                "id" => $workspaceId,
                "name" => $name,
                "role" => "admin"
            ]
        ]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendResponse(500, ["status" => "error", "message" => "Failed to create workspace. " . $e->getMessage()]);
    }
}
elseif ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch workspaces the user is a member of
    $stmt = $pdo->prepare("
        SELECT w.id, w.name, w.created_at, wm.role,
               (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count
        FROM workspaces w
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE wm.user_id = ?
        ORDER BY w.created_at DESC
    ");
    $stmt->execute([$userId]);
    $workspaces = $stmt->fetchAll();

    sendResponse(200, ["status" => "success", "workspaces" => $workspaces]);
}
elseif ($action === 'members' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['workspace_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Workspace ID is required."]);
    }
    $workspaceId = $_GET['workspace_id'];

    // Verify current user has access to this workspace
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied to this workspace."]);
    }

    // Fetch members
    $stmt = $pdo->prepare("
        SELECT u.id, u.full_name, u.email, wm.role, wm.joined_at
        FROM workspace_members wm
        JOIN users u ON wm.user_id = u.id
        WHERE wm.workspace_id = ?
        ORDER BY u.full_name ASC
    ");
    $stmt->execute([$workspaceId]);
    $members = $stmt->fetchAll();

    sendResponse(200, ["status" => "success", "members" => $members]);
}
elseif ($action === 'add_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['workspace_id']) || !isset($input['email']) || !isset($input['role'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing required fields."]);
    }

    $workspaceId = $input['workspace_id'];
    $newMemberEmail = trim($input['email']);
    $role = $input['role'];

    // Verify current user is admin of this workspace
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    $currentUserRole = $stmt->fetchColumn();

    if ($currentUserRole !== 'admin') {
        sendResponse(403, ["status" => "error", "message" => "Only admins can add members."]);
    }

    // Find user by email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$newMemberEmail]);
    $newMemberId = $stmt->fetchColumn();

    if (!$newMemberId) {
        sendResponse(404, ["status" => "error", "message" => "User with this email not found."]);
    }

        // Add to workspace
    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)");
        $stmt->execute([$workspaceId, $newMemberId, $role]);
        
        // Log activity
        $stmtName = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
        $stmtName->execute([$newMemberId]);
        $newMemberName = $stmtName->fetchColumn();

        $details = json_encode(['member_name' => $newMemberName, 'role' => $role]);
        $stmtLog = $pdo->prepare("INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES (?, ?, 'member_added', ?, ?)");
        $stmtLog->execute([$workspaceId, $userId, $newMemberId, $details]);

        $pdo->commit();

        sendResponse(201, ["status" => "success", "message" => "Member added successfully."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        // Handle duplicate key error
        if ($e->getCode() == 23000) {
            sendResponse(409, ["status" => "error", "message" => "User is already a member."]);
        }
        sendResponse(500, ["status" => "error", "message" => "Failed to add member."]);
    }
}
elseif ($action === 'remove_member' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['workspace_id']) || !isset($input['user_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing required fields."]);
    }

    $workspaceId = $input['workspace_id'];
    $targetUserId = $input['user_id'];

    // Verify current user is admin of this workspace
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    $currentUserRole = $stmt->fetchColumn();

    if ($currentUserRole !== 'admin') {
        sendResponse(403, ["status" => "error", "message" => "Only admins can remove members."]);
    }

    // Prevent removing yourself if you are the only admin
    if ($userId == $targetUserId) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM workspace_members WHERE workspace_id = ? AND role = 'admin'");
        $stmt->execute([$workspaceId]);
        $adminCount = $stmt->fetchColumn();
        if ($adminCount <= 1) {
            sendResponse(400, ["status" => "error", "message" => "Cannot remove the only admin of the workspace."]);
        }
    }

    // Delete from workspace
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
        $stmt->execute([$workspaceId, $targetUserId]);
        
        // Explicitly remove from document_members for documents in this workspace
        $stmt = $pdo->prepare("
            DELETE dm FROM document_members dm
            JOIN documents d ON dm.document_id = d.id
            WHERE d.workspace_id = ? AND dm.user_id = ?
        ");
        $stmt->execute([$workspaceId, $targetUserId]);

        // Log activity
        $stmtName = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
        $stmtName->execute([$targetUserId]);
        $targetMemberName = $stmtName->fetchColumn() ?: 'Unknown User';

        $details = json_encode(['member_name' => $targetMemberName]);
        $stmtLog = $pdo->prepare("INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_id, details) VALUES (?, ?, 'member_removed', ?, ?)");
        $stmtLog->execute([$workspaceId, $userId, $targetUserId, $details]);

        $pdo->commit();
        sendResponse(200, ["status" => "success", "message" => "Member removed successfully."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        sendResponse(500, ["status" => "error", "message" => "Failed to remove member."]);
    }
}
elseif ($action === 'recent_activity' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT al.id, al.action_type, al.details, al.created_at,
               u.full_name as user_name,
               w.name as workspace_name
        FROM activity_logs al
        JOIN users u ON al.user_id = u.id
        JOIN workspaces w ON al.workspace_id = w.id
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE wm.user_id = ?
        ORDER BY al.created_at DESC
        LIMIT 20
    ");
    $stmt->execute([$userId]);
    $activities = $stmt->fetchAll();

    // Decode JSON details for easier frontend parsing
    foreach ($activities as &$act) {
        if ($act['details']) {
            $act['details'] = json_decode($act['details'], true);
        }
    }

    sendResponse(200, ["status" => "success", "activities" => $activities]);
}
elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['workspace_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Workspace ID is required."]);
    }
    
    $workspaceId = $input['workspace_id'];

    // Verify current user is admin of this workspace
    $stmt = $pdo->prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?");
    $stmt->execute([$workspaceId, $userId]);
    $currentUserRole = $stmt->fetchColumn();

    if ($currentUserRole !== 'admin') {
        sendResponse(403, ["status" => "error", "message" => "Only admins can delete this workspace."]);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM workspaces WHERE id = ?");
        $stmt->execute([$workspaceId]);
        
        sendResponse(200, ["status" => "success", "message" => "Workspace deleted successfully."]);
    } catch (PDOException $e) {
        sendResponse(500, ["status" => "error", "message" => "Failed to delete workspace."]);
    }
}
else {
    sendResponse(404, ["status" => "error", "message" => "Endpoint not found or invalid method."]);
}
?>
