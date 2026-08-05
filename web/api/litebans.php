<?php
/**
 * LiteBans MySQL Real Database API Integration Endpoint
 * Server: IrisMC Network (irismc.asia)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database Configuration (Cấu hình kết nối Database MySQL LiteBans thật)
$db_host = '103.188.82.22';
$db_port = '3306';
$db_name = 's1210_litebans';
$db_user = 'u1210_UeAmpB5CdA';
$db_pass = 'hCFbmv9Tb5AGaC+uZ1@tlGA=';
$table_prefix = 'litebans_';

try {
    // Timeout 5 seconds for remote MySQL connection
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    // Function to safely query count from a table
    function getCount($pdo, $sql) {
        try {
            $stmt = $pdo->query($sql);
            return (int)$stmt->fetchColumn();
        } catch (Exception $e) {
            return 0;
        }
    }

    $totalBans = getCount($pdo, "SELECT COUNT(*) FROM {$table_prefix}bans");
    $totalMutes = getCount($pdo, "SELECT COUNT(*) FROM {$table_prefix}mutes");
    $totalWarns = getCount($pdo, "SELECT COUNT(*) FROM {$table_prefix}warnings");
    $activeCount = getCount($pdo, "SELECT COUNT(*) FROM {$table_prefix}bans WHERE active = 1 AND (until <= 0 OR until > (UNIX_TIMESTAMP() * 1000))");

    // Fetch penalties from each LiteBans table
    $penalties = [];

    // 1. Fetch Bans
    try {
        $stmt = $pdo->query("SELECT 'ban' as type, name, reason, banned_by_name as staff, time, until, active FROM {$table_prefix}bans ORDER BY time DESC LIMIT 30");
        while ($row = $stmt->fetch()) {
            $penalties[] = formatPenaltyRow($row);
        }
    } catch (Exception $e) {}

    // 2. Fetch Mutes
    try {
        $stmt = $pdo->query("SELECT 'mute' as type, name, reason, banned_by_name as staff, time, until, active FROM {$table_prefix}mutes ORDER BY time DESC LIMIT 20");
        while ($row = $stmt->fetch()) {
            $penalties[] = formatPenaltyRow($row);
        }
    } catch (Exception $e) {}

    // 3. Fetch Warns
    try {
        $stmt = $pdo->query("SELECT 'warn' as type, name, reason, banned_by_name as staff, time, until, active FROM {$table_prefix}warnings ORDER BY time DESC LIMIT 20");
        while ($row = $stmt->fetch()) {
            $penalties[] = formatPenaltyRow($row);
        }
    } catch (Exception $e) {}

    // 4. Fetch Kicks
    try {
        $stmt = $pdo->query("SELECT 'kick' as type, name, reason, banned_by_name as staff, time, 0 as until, 0 as active FROM {$table_prefix}kicks ORDER BY time DESC LIMIT 10");
        while ($row = $stmt->fetch()) {
            $penalties[] = formatPenaltyRow($row);
        }
    } catch (Exception $e) {}

    // Sort combined penalties by time DESC
    usort($penalties, function($a, $b) {
        return $b['timestamp'] - $a['timestamp'];
    });

    // Limit to top 50
    $penalties = array_slice($penalties, 0, 50);

    echo json_encode([
        'status' => 'success',
        'connected' => true,
        'stats' => [
            'bans' => $totalBans,
            'mutes' => $totalMutes,
            'warns' => $totalWarns,
            'active' => $activeCount
        ],
        'penalties' => $penalties
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    // Return error information and fallback list
    echo json_encode([
        'status' => 'fallback',
        'connected' => false,
        'error_details' => $e->getMessage(),
        'instruction' => 'Kiểm tra remote access MySQL (Cho phép Remote IP từ Web Host trong cPanel/Pterodactyl hoặc MySQL Bind Address 0.0.0.0)',
        'stats' => [
            'bans' => 1248,
            'mutes' => 482,
            'warns' => 890,
            'active' => 42
        ],
        'penalties' => [
            ['name' => 'XRay_Hunter_99', 'type' => 'ban', 'reason' => 'Sử dụng phần mềm gian lận (Modpack X-Ray)', 'staff' => '[Console / IrisShield]', 'duration' => 'Vĩnh viễn', 'status' => 'active', 'time' => '10 phút trước', 'timestamp' => time() - 600],
            ['name' => 'BadBoy_MC', 'type' => 'mute', 'reason' => 'Sử dụng từ ngữ thô tục, xúc phạm người chơi khác', 'staff' => 'Supporter_VN', 'duration' => '1 Ngày', 'status' => 'active', 'time' => '1 giờ trước', 'timestamp' => time() - 3600],
            ['name' => 'GriefMaster', 'type' => 'ban', 'reason' => 'Cố tình phá hoại công trình & Bao quanh Claim', 'staff' => 'Yaanghi', 'duration' => '7 Ngày', 'status' => 'active', 'time' => '3 giờ trước', 'timestamp' => time() - 10800],
            ['name' => 'HackerPro2026', 'type' => 'ban', 'reason' => 'Sử dụng Auto-Clicker & KillAura trong KitPvP', 'staff' => '[Console / IrisShield]', 'duration' => 'Vĩnh viễn', 'status' => 'active', 'time' => '5 giờ trước', 'timestamp' => time() - 18000],
            ['name' => 'Scammer_VN', 'type' => 'ban', 'reason' => 'Cố tình lừa đảo (Scam) vật phẩm rương người chơi', 'staff' => 'SnightMC', 'duration' => '30 Ngày', 'status' => 'active', 'time' => '12 giờ trước', 'timestamp' => time() - 43200],
            ['name' => 'SpamBot_01', 'type' => 'mute', 'reason' => 'Spam quảng cáo server IP khác ở kênh Chat chung', 'staff' => '[Console / IrisShield]', 'duration' => 'Vĩnh viễn', 'status' => 'active', 'time' => '1 ngày trước', 'timestamp' => time() - 86400],
            ['name' => 'NoobPlayer', 'type' => 'warn', 'reason' => 'Cảnh báo lần 1: Đặt tên vật phẩm không phù hợp', 'staff' => 'SnightMC', 'duration' => 'Đã nhắc nhở', 'status' => 'expired', 'time' => '2 ngày trước', 'timestamp' => time() - 172800],
            ['name' => 'TrollKing', 'type' => 'kick', 'reason' => 'Cố tình AFK làm đầy máy chủ trong giờ cao điểm', 'staff' => 'Supporter_VN', 'duration' => 'Đã Kick', 'status' => 'expired', 'time' => '3 ngày trước', 'timestamp' => time() - 259200],
            ['name' => 'FlyHack_PE', 'type' => 'ban', 'reason' => 'Sử dụng Fly Mod trên phiên bản Mobile Bedrock', 'staff' => '[Console / IrisShield]', 'duration' => 'Vĩnh viễn', 'status' => 'active', 'time' => '4 ngày trước', 'timestamp' => time() - 345600],
            ['name' => 'BugDuper_99', 'type' => 'ban', 'reason' => 'Lợi dụng Bug game dupe Kim Cương trái phép', 'staff' => 'Yaanghi', 'duration' => 'Vĩnh viễn', 'status' => 'active', 'time' => '5 ngày trước', 'timestamp' => time() - 432000]
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

function formatPenaltyRow($row) {
    $now = time() * 1000;
    $timeMs = (float)$row['time'];
    $untilMs = (float)$row['until'];
    $isExpired = false;

    if ($untilMs > 0 && $untilMs <= $now) {
        $isExpired = true;
    } elseif ($row['active'] == 0 && $row['type'] !== 'kick') {
        $isExpired = true;
    }

    if ($row['type'] === 'kick') {
        $durationStr = 'Đã Kick';
    } elseif ($untilMs <= 0) {
        $durationStr = 'Vĩnh viễn';
    } else {
        $diffSec = ($untilMs - $timeMs) / 1000;
        if ($diffSec >= 86400) {
            $durationStr = round($diffSec / 86400) . ' Ngày';
        } elseif ($diffSec >= 3600) {
            $durationStr = round($diffSec / 3600) . ' Giờ';
        } else {
            $durationStr = max(1, round($diffSec / 60)) . ' Phút';
        }
    }

    $timeAgoSec = max(0, (time() * 1000 - $timeMs) / 1000);
    if ($timeAgoSec < 60) {
        $timeAgo = 'Vừa xong';
    } elseif ($timeAgoSec < 3600) {
        $timeAgo = floor($timeAgoSec / 60) . ' phút trước';
    } elseif ($timeAgoSec < 86400) {
        $timeAgo = floor($timeAgoSec / 3600) . ' giờ trước';
    } else {
        $timeAgo = floor($timeAgoSec / 86400) . ' ngày trước';
    }

    return [
        'name' => $row['name'] ?: 'Unknown',
        'type' => $row['type'],
        'reason' => $row['reason'] ?: 'Không có lý do',
        'staff' => $row['staff'] ?: '[Console]',
        'duration' => $durationStr,
        'status' => ($isExpired || $row['type'] === 'kick') ? 'expired' : 'active',
        'time' => $timeAgo,
        'timestamp' => floor($timeMs / 1000)
    ];
}
