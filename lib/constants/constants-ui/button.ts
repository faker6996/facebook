export const VARIANT_STYLES_BTN = {
  // Nút mặc định: nền trắng/đen, viền, chữ màu chính với backdrop blur
  default: "bg-background/80 backdrop-blur-sm text-foreground border border-border hover:bg-muted/80 hover:border-accent-foreground/20",

  // Nút viền: trong suốt, có viền, nền thay đổi khi hover với glow effect
  outline: "bg-transparent backdrop-blur-sm border border-input hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/30 hover:shadow-md",

  // Nút chính: sử dụng màu primary với gradient và shadow
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-[1.02] border border-primary/20",

  // Nút thành công: sử dụng màu success với enhanced effects
  success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-success/25 hover:scale-[1.02] border border-success/20",

  // Nút nguy hiểm: sử dụng màu destructive với warning effects
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-destructive/25 hover:scale-[1.02] border border-destructive/20",

  // Nút cảnh báo: sử dụng màu warning với glow
  warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-warning/25 hover:scale-[1.02] border border-warning/20",

  // Nút thông tin: sử dụng màu info với soft effects
  info: "bg-info text-info-foreground hover:bg-info/90 shadow-md hover:shadow-info/25 hover:scale-[1.02] border border-info/20",

  // Nút "ma": trong suốt, không viền, hiệu ứng mềm mại khi hover
  ghost: "bg-transparent hover:bg-accent/60 hover:text-accent-foreground backdrop-blur-sm transition-all duration-200",

  // Nút dạng link: trong suốt, không viền, gạch chân với primary color
  link: "text-primary bg-transparent underline-offset-4 hover:underline hover:text-primary/80 transition-colors duration-200",
};

export const SIZE_STYLES_BTN = {
  sm: "px-3 py-1.5 text-sm h-8 min-w-[2rem] md:px-2.5 md:py-1 md:h-7 md:text-xs",
  md: "px-4 py-2 text-sm h-10 min-w-[2.5rem] md:px-3 md:py-1.5 md:h-9",
  lg: "px-6 py-3 text-base h-12 min-w-[3rem] md:px-4 md:py-2 md:h-10 md:text-sm",
  smx: "px-3.5 py-1.5 text-[13px] h-9 min-w-[2.25rem] md:px-3 md:py-1 md:h-8 md:text-xs",
  icon: "w-11 h-11 p-0 rounded-full flex items-center justify-center md:w-10 md:h-10",
};
