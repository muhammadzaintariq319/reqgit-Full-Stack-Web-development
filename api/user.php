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

// Read JSON input for POST/PUT
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if ($action === 'upload_profile_pic' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['profile_pic'])) {
        sendResponse(400, ["status" => "error", "message" => "No file uploaded."]);
    }

    $file = $_FILES['profile_pic'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendResponse(400, ["status" => "error", "message" => "File upload error."]);
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        sendResponse(400, ["status" => "error", "message" => "Only JPG, PNG and GIF files are allowed."]);
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB
        sendResponse(400, ["status" => "error", "message" => "File size exceeds 5MB limit."]);
    }

    $uploadDir = __DIR__ . '/uploads/profiles/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Delete old profile pic if exists
    $stmt = $pdo->prepare("SELECT profile_pic FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $oldPic = $stmt->fetchColumn();
    
    if ($oldPic && file_exists(__DIR__ . '/' . $oldPic)) {
        unlink(__DIR__ . '/' . $oldPic);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
    $destination = $uploadDir . $filename;
    
    $relativePath = 'uploads/profiles/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        $stmt = $pdo->prepare("UPDATE users SET profile_pic = ? WHERE id = ?");
        $stmt->execute([$relativePath, $userId]);

        sendResponse(200, [
            "status" => "success", 
            "message" => "Profile picture uploaded.", 
            "profile_pic" => $relativePath
        ]);
    } else {
        sendResponse(500, ["status" => "error", "message" => "Failed to save file."]);
    }
}
elseif ($action === 'remove_profile_pic' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("SELECT profile_pic FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $oldPic = $stmt->fetchColumn();
    
    if ($oldPic && file_exists(__DIR__ . '/' . $oldPic)) {
        unlink(__DIR__ . '/' . $oldPic);
    }

    $stmt = $pdo->prepare("UPDATE users SET profile_pic = NULL WHERE id = ?");
    $stmt->execute([$userId]);

    sendResponse(200, ["status" => "success", "message" => "Profile picture removed."]);
}
elseif ($action === 'change_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['current_password']) || !isset($input['new_password'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing required fields."]);
    }

    $currentPassword = $input['current_password'];
    $newPassword = $input['new_password'];

    // Verify current password
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($currentPassword, $user['password_hash'])) {
        // Hash new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        if ($stmt->execute([$newPasswordHash, $userId])) {
            sendResponse(200, ["status" => "success", "message" => "Password updated successfully."]);
        } else {
            sendResponse(500, ["status" => "error", "message" => "Failed to update password."]);
        }
    } else {
        sendResponse(401, ["status" => "error", "message" => "Incorrect current password."]);
    }
}
elseif ($action === 'update_profile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['full_name']) || !isset($input['email'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing required fields."]);
    }

    $fullName = trim($input['full_name']);
    $email = trim($input['email']);

    // Check if email is already taken by someone else
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        sendResponse(409, ["status" => "error", "message" => "Email is already in use by another account."]);
    }

    $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ? WHERE id = ?");
    if ($stmt->execute([$fullName, $email, $userId])) {
        // Fetch updated user to return
        $stmt = $pdo->prepare("SELECT id, full_name, email, profile_pic FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch();

        // Re-issue token with new email (optional, but good practice if email is in payload)
        $payload = [
            'user_id' => $updatedUser['id'],
            'email' => $updatedUser['email'],
            'exp' => time() + (60 * 60 * 24 * 7)
        ];
        $newToken = JWT::encode($payload, JWT_SECRET);

        sendResponse(200, [
            "status" => "success", 
            "message" => "Profile updated successfully.",
            "user" => $updatedUser,
            "token" => $newToken
        ]);
    } else {
        sendResponse(500, ["status" => "error", "message" => "Failed to update profile."]);
    }
}
else {
    sendResponse(404, ["status" => "error", "message" => "Endpoint not found."]);
}
