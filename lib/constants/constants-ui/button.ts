export const VARIANT_STYLES_BTN = {
  // Nút mặc định: nền trắng/đen, viền, chữ màu chính
  default: "bg-background text-foreground border border-border hover:bg-muted",

  // Nút viền: trong suốt, có viền, nền thay đổi khi hover
  outline: "bg-transparent border border-input hover:bg-accent hover:text-accent-foreground",

  // Nút chính: sử dụng màu primary của thương hiệu
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",

  // Nút thành công: sử dụng màu success của theme
  success: "bg-success text-success-foreground hover:bg-success/90",

  // Nút nguy hiểm: sử dụng màu destructive (thường là đỏ)
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

  // Nút cảnh báo: sử dụng màu warning của theme
  warning: "bg-warning text-warning-foreground hover:bg-warning/90",

  // Nút thông tin: sử dụng màu info của theme
  info: "bg-info text-info-foreground hover:bg-info/90",

  // Nút "ma": trong suốt, không viền, chỉ hiện nền khi hover
  ghost: "hover:bg-accent hover:text-accent-foreground",

  // Nút dạng link: trong suốt, không viền, có gạch chân khi hover
  link: "text-primary underline-offset-4 hover:underline",
};

export const SIZE_STYLES_BTN = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
  smx: "px-3.5 py-1.5 text-[13px]",
  icon: "w-10 h-10 p-0 rounded-full",
};
