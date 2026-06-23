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

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['document_id']) || !isset($_POST['version_label'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID and Version Label are required."]);
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        sendResponse(400, ["status" => "error", "message" => "File upload failed or no file provided."]);
    }

    $documentId = $_POST['document_id'];
    $versionLabel = trim($_POST['version_label']);
    $summary = isset($_POST['changes_summary']) ? trim($_POST['changes_summary']) : '';
    $file = $_FILES['file'];

    // Verify user has access to the workspace this document belongs to
    $stmt = $pdo->prepare("
        SELECT w.id FROM documents d
        JOIN workspaces w ON d.workspace_id = w.id
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE d.id = ? AND wm.user_id = ?
    ");
    $stmt->execute([$documentId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied to this document."]);
    }

    // Process File
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = uniqid('doc_v_') . '.' . $ext;
    $destination = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Insert new version
        $stmt = $pdo->prepare("INSERT INTO document_versions (document_id, version_label, file_path, changes_summary, uploaded_by) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$documentId, $versionLabel, $newFileName, $summary, $userId])) {
            sendResponse(201, [
                "status" => "success",
                "message" => "New version uploaded successfully.",
                "version" => $versionLabel
            ]);
        } else {
            unlink($destination);
            sendResponse(500, ["status" => "error", "message" => "Failed to save version record."]);
        }
    } else {
        sendResponse(500, ["status" => "error", "message" => "Failed to move uploaded file."]);
    }
}
elseif ($action === 'timeline' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['document_id'])) {
        sendResponse(400, ["status" => "error", "message" => "Document ID is required."]);
    }

    $documentId = $_GET['document_id'];

    // Verify access
    $stmt = $pdo->prepare("
        SELECT w.id FROM documents d
        JOIN workspaces w ON d.workspace_id = w.id
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE d.id = ? AND wm.user_id = ?
    ");
    $stmt->execute([$documentId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(403, ["status" => "error", "message" => "Access denied to this document."]);
    }

    // Fetch timeline
    $stmt = $pdo->prepare("
        SELECT dv.id, dv.version_label, dv.file_path, dv.changes_summary, dv.created_at, u.full_name as uploaded_by_name
        FROM document_versions dv
        JOIN users u ON dv.uploaded_by = u.id
        WHERE dv.document_id = ?
        ORDER BY dv.created_at DESC
    ");
    $stmt->execute([$documentId]);
    $timeline = $stmt->fetchAll();

    sendResponse(200, ["status" => "success", "timeline" => $timeline]);
}
else {
    sendResponse(404, ["status" => "error", "message" => "Endpoint not found or invalid method."]);
}
?>
