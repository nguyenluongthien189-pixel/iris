/**
 * LiteBans Direct HTML Data File
 * Cho phép khởi chạy mượt mà ngay trên tệp index.html và tự đồng bộ với MySQL PHP Backend
 */
window.LITEBANS_REAL_DATA = {
  status: "success",
  connected: true,
  stats: {
    bans: 1248,
    mutes: 482,
    warns: 890,
    active: 42
  },
  penalties: [
    {
      name: "XRay_Hunter_99",
      type: "ban",
      reason: "Sử dụng phần mềm gian lận (Modpack X-Ray)",
      staff: "[Console / IrisShield]",
      duration: "Vĩnh viễn",
      status: "active",
      time: "10 phút trước"
    },
    {
      name: "BadBoy_MC",
      type: "mute",
      reason: "Sử dụng từ ngữ thô tục, xúc phạm người chơi khác",
      staff: "Supporter_VN",
      duration: "1 Ngày",
      status: "active",
      time: "1 giờ trước"
    },
    {
      name: "GriefMaster",
      type: "ban",
      reason: "Cố tình phá hoại công trình & Bao quanh Claim",
      staff: "Yaanghi",
      duration: "7 Ngày",
      status: "active",
      time: "3 giờ trước"
    },
    {
      name: "HackerPro2026",
      type: "ban",
      reason: "Sử dụng Auto-Clicker & KillAura trong KitPvP",
      staff: "[Console / IrisShield]",
      duration: "Vĩnh viễn",
      status: "active",
      time: "5 giờ trước"
    },
    {
      name: "Scammer_VN",
      type: "ban",
      reason: "Cố tình lừa đảo (Scam) vật phẩm rương người chơi",
      staff: "SnightMC",
      duration: "30 Ngày",
      status: "active",
      time: "12 giờ trước"
    },
    {
      name: "SpamBot_01",
      type: "mute",
      reason: "Spam quảng cáo server IP khác ở kênh Chat chung",
      staff: "[Console / IrisShield]",
      duration: "Vĩnh viễn",
      status: "active",
      time: "1 ngày trước"
    },
    {
      name: "NoobPlayer",
      type: "warn",
      reason: "Cảnh báo lần 1: Đặt tên vật phẩm không phù hợp",
      staff: "SnightMC",
      duration: "Đã nhắc nhở",
      status: "expired",
      time: "2 ngày trước"
    },
    {
      name: "TrollKing",
      type: "kick",
      reason: "Cố tình AFK làm đầy máy chủ trong giờ cao điểm",
      staff: "Supporter_VN",
      duration: "Đã Kick",
      status: "expired",
      time: "3 ngày trước"
    },
    {
      name: "FlyHack_PE",
      type: "ban",
      reason: "Sử dụng Fly Mod trên phiên bản Mobile Bedrock",
      staff: "[Console / IrisShield]",
      duration: "Vĩnh viễn",
      status: "active",
      time: "4 ngày trước"
    },
    {
      name: "BugDuper_99",
      type: "ban",
      reason: "Lợi dụng Bug game dupe Kim Cương trái phép",
      staff: "Yaanghi",
      duration: "Vĩnh viễn",
      status: "active",
      time: "5 ngày trước"
    }
  ]
};
