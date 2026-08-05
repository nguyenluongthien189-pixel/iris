# LiteBans Direct MySQL Sync Script for Local HTML
$dllPath = Get-ChildItem -Path "$env:TEMP\mysqlconnector" -Filter "MySqlConnector.dll" -Recurse | Select-Object -First 1 -ExpandProperty FullName

if (-not $dllPath) {
    Write-Host "DLL MySqlConnector.dll not found yet."
    exit 1
}

Add-Type -Path $dllPath

$connStr = "Server=103.188.82.22;Port=3306;Database=s1210_litebans;Uid=u1210_UeAmpB5CdA;Pwd=hCFbmv9Tb5AGaC+uZ1@tlGA=;SslMode=None;"
$conn = New-Object MySqlConnector.MySqlConnection($connStr)

try {
    $conn.Open()
    Write-Host "✅ Connected to MySQL database s1210_litebans on 103.188.82.22 successfully!"

    # Get Counts
    $cmdBans = New-Object MySqlConnector.MySqlCommand("SELECT COUNT(*) FROM litebans_bans", $conn)
    $totalBans = [int]$cmdBans.ExecuteScalar()

    $cmdMutes = New-Object MySqlConnector.MySqlCommand("SELECT COUNT(*) FROM litebans_mutes", $conn)
    $totalMutes = [int]$cmdMutes.ExecuteScalar()

    $cmdWarns = New-Object MySqlConnector.MySqlCommand("SELECT COUNT(*) FROM litebans_warnings", $conn)
    $totalWarns = [int]$cmdWarns.ExecuteScalar()

    $cmdActive = New-Object MySqlConnector.MySqlCommand("SELECT COUNT(*) FROM litebans_bans WHERE active = 1 AND (until <= 0 OR until > UNIX_TIMESTAMP() * 1000)", $conn)
    $activeCount = [int]$cmdActive.ExecuteScalar()

    # Query Recent Penalties
    $sql = "
        SELECT 'ban' as type, name, reason, banned_by_name as staff, time, until, active FROM litebans_bans
        UNION ALL
        SELECT 'mute' as type, name, reason, banned_by_name as staff, time, until, active FROM litebans_mutes
        UNION ALL
        SELECT 'warn' as type, name, reason, banned_by_name as staff, time, until, active FROM litebans_warnings
        UNION ALL
        SELECT 'kick' as type, name, reason, banned_by_name as staff, time, 0 as until, 0 as active FROM litebans_kicks
        ORDER BY time DESC LIMIT 50
    "
    $cmd = New-Object MySqlConnector.MySqlCommand($sql, $conn)
    $reader = $cmd.ExecuteReader()

    $penalties = @()
    $nowMs = [double]([DateTimeOffset]::Now.ToUnixTimeMilliseconds())

    while ($reader.Read()) {
        $type = $reader["type"].ToString()
        $name = if ($reader["name"]) { $reader["name"].ToString() } else { "Unknown" }
        $reason = if ($reader["reason"]) { $reader["reason"].ToString() } else { "Không có lý do" }
        $staff = if ($reader["staff"]) { $reader["staff"].ToString() } else { "[Console]" }
        $timeMs = [double]$reader["time"]
        $untilMs = [double]$reader["until"]
        $active = [int]$reader["active"]

        $isExpired = $false
        if ($untilMs -gt 0 -and $untilMs -le $nowMs) {
            $isExpired = $true
        } elseif ($active -eq 0 -and $type -ne "kick") {
            $isExpired = $true
        }

        # Duration string
        if ($type -eq "kick") {
            $durationStr = "Đã Kick"
        } elseif ($untilMs -le 0) {
            $durationStr = "Vĩnh viễn"
        } else {
            $diffSec = ($untilMs - $timeMs) / 1000
            if ($diffSec -ge 86400) {
                $durationStr = "$([Math]::Round($diffSec / 86400)) Ngày"
            } elseif ($diffSec -ge 3600) {
                $durationStr = "$([Math]::Round($diffSec / 3600)) Giờ"
            } else {
                $durationStr = "$([Math]::Max(1, [Math]::Round($diffSec / 60))) Phút"
            }
        }

        # Time ago string
        $timeAgoSec = [Math]::Max(0, ($nowMs - $timeMs) / 1000)
        if ($timeAgoSec -lt 60) {
            $timeAgo = "Vừa xong"
        } elseif ($timeAgoSec -lt 3600) {
            $timeAgo = "$([Math]::Floor($timeAgoSec / 60)) phút trước"
        } elseif ($timeAgoSec -lt 86400) {
            $timeAgo = "$([Math]::Floor($timeAgoSec / 3600)) giờ trước"
        } else {
            $timeAgo = "$([Math]::Floor($timeAgoSec / 86400)) ngày trước"
        }

        $penalties += [PSCustomObject]@{
            name = $name
            type = $type
            reason = $reason
            staff = $staff
            duration = $durationStr
            status = if ($isExpired -or $type -eq "kick") { "expired" } else { "active" }
            time = $timeAgo
        }
    }

    $reader.Close()
    $conn.Close()

    # Generate JSON
    $jsonObj = [PSCustomObject]@{
        status = "success"
        connected = $true
        stats = [PSCustomObject]@{
            bans = $totalBans
            mutes = $totalMutes
            warns = $totalWarns
            active = $activeCount
        }
        penalties = $penalties
    }

    $jsonStr = $jsonObj | ConvertTo-Json -Depth 5
    $jsContent = "/** Realtime LiteBans Data synced from MySQL 103.188.82.22 **/`nwindow.LITEBANS_REAL_DATA = $jsonStr;"
    
    $jsPath = "c:\Users\Administrator\Desktop\web\api\litebans_data.js"
    Set-Content -Path $jsPath -Value $jsContent -Encoding UTF8
    Write-Host "🎉 Successfully synced REAL MySQL data into api/litebans_data.js!"

} catch {
    Write-Host "Error connecting or querying MySQL: $_"
    if ($conn.State -eq 'Open') { $conn.Close() }
}
