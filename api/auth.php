<?php
require_once 'config.php';
require_once 'jwt.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Read JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['full_name']) || !isset($input['email']) || !isset($input['password'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing required fields."]);
    }

    $fullName = trim($input['full_name']);
    $email = trim($input['email']);
    $password = $input['password'];

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendResponse(409, ["status" => "error", "message" => "Email already registered."]);
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
    if ($stmt->execute([$fullName, $email, $passwordHash])) {
        $userId = $pdo->lastInsertId();
        
        // Generate Token
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'exp' => time() + (60 * 60 * 24 * 7) // Token valid for 7 days
        ];
        $token = JWT::encode($payload, JWT_SECRET);

        sendResponse(201, [
            "status" => "success",
            "message" => "Registration successful.",
            "token" => $token,
            "user" => [
                "id" => $userId,
                "full_name" => $fullName,
                "email" => $email
            ]
        ]);
    } else {
        sendResponse(500, ["status" => "error", "message" => "Registration failed."]);
    }
} 
elseif ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['email']) || !isset($input['password'])) {
        sendResponse(400, ["status" => "error", "message" => "Missing email or password."]);
    }

    $email = trim($input['email']);
    $password = $input['password'];

    $stmt = $pdo->prepare("SELECT id, full_name, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate Token
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'exp' => time() + (60 * 60 * 24 * 7)
        ];
        $token = JWT::encode($payload, JWT_SECRET);

        sendResponse(200, [
            "status" => "success",
            "message" => "Login successful.",
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "email" => $user['email']
            ]
        ]);
    } else {
        sendResponse(401, ["status" => "error", "message" => "Invalid email or password."]);
    }
}
elseif ($action === 'verify' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint to check if token is valid
    $token = JWT::getBearerToken();
    if (!$token) {
        sendResponse(401, ["status" => "error", "message" => "No token provided."]);
    }

    $payload = JWT::decode($token, JWT_SECRET);
    if ($payload) {
        // Fetch fresh user data
        $stmt = $pdo->prepare("SELECT id, full_name, email, profile_pic FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            sendResponse(200, ["status" => "success", "user" => $user]);
        }
    }
    
    sendResponse(401, ["status" => "error", "message" => "Invalid or expired token."]);
}
else {
    sendResponse(404, ["status" => "error", "message" => "Endpoint not found or invalid method."]);
}
?>
