<?php
// api/config.php

// Handle CORS Headers for React Frontend
header("Access-Control-Allow-Origin: *"); // Change '*' to 'http://localhost:5173' in production
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure the response is always JSON
header("Content-Type: application/json; charset=UTF-8");

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'reqgit_db');
define('DB_USER', 'root'); // Change to your DB username
define('DB_PASS', '');     // Change to your DB password

// Secret key for JWT
define('JWT_SECRET', 'reqgit_super_secret_key_12345!@#'); 

// Create PDO Connection
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit();
}

/**
 * Utility function to send JSON response and exit
 */
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}
?>
