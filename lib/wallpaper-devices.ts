export const WALLPAPER_DEVICE_OPTIONS = [
  { id: "desktop", label: "PC", icon: "▣", ratio: "16 / 9", description: "Desktop & laptop" },
  { id: "tablet", label: "Tablet", icon: "▤", ratio: "4 / 3", description: "Tablet screens" },
  { id: "mobile", label: "Mobile", icon: "▯", ratio: "9 / 16", description: "Phones" }
] as const;

export type WallpaperDevice = typeof WALLPAPER_DEVICE_OPTIONS[number]["id"];

export const WALLPAPER_DEVICE_LABELS: Record<WallpaperDevice, string> = {
  desktop: "PC",
  tablet: "Tablet",
  mobile: "Mobile"
};

export const ALL_WALLPAPER_DEVICES: WallpaperDevice[] = ["desktop", "tablet", "mobile"];

export function getPreferredWallpaperDevice(devices?:readonly string[]):WallpaperDevice{
  const value=devices?.[0];
  return value==="desktop"||value==="tablet"||value==="mobile"?value:"desktop";
}
