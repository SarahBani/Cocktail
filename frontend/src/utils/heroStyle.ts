import { HUE_MULTIPLIER, HUE_OFFSET, HUE_RANGE } from "@/constants";

export const heroStyle = (id: number): { background: string } => {
  const hue = (id * HUE_MULTIPLIER) % HUE_RANGE;
  return {
    background: `linear-gradient(135deg, hsl(${hue},70%,30%), hsl(${(hue + HUE_OFFSET) % HUE_RANGE},80%,20%))`,
  };
};
