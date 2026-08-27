import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Shuttle / Weaving icon (Textiles & Handloom)
export const ShuttleIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12 C3 9 6 6 12 6 C18 6 21 9 21 12 C21 15 18 18 12 18 C6 18 3 15 3 12Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M6 9 L8 12 L6 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 9 L16 12 L18 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Potter's Wheel icon (Pottery & Ceramics)
export const PotterWheelIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="4" x2="12" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="15" x2="12" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="12" x2="9" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="15" y1="12" x2="20" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Chisel / Woodwork icon (Woodwork & Carving)
export const ChiselIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 19 L14 10 L16 8 L18 6 L20 8 L18 10 L16 12 L7 21Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="5" y1="19" x2="3" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14" y1="10" x2="16" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Needle / Embroidery icon
export const NeedleIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3 L12 14 L9 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="5" r="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 14 L15 21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M9 17 L15 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Brush / Folk Painting icon
export const BrushIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21 C5 19 7 16 10 14 L16 8 L20 4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 4 L16 8"
      stroke={color}
      strokeWidth={strokeWidth * 2}
      strokeLinecap="round"
    />
    <Path
      d="M3 21 C3 18 6 17 8 20 C7 22 4 22 3 21Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Leaf / Bamboo icon
export const LeafIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4 C20 4 18 10 12 14 C8 17 4 18 4 18 C4 18 6 12 12 8 C16 5 20 4 20 4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 18 L10 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Generic craft box icon
export const CraftBoxIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#2B2420',
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="8" width="18" height="13" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M3 8 L12 4 L21 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="8" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Map of craft category to icon
export const CRAFT_ICON_MAP: Record<string, React.FC<IconProps>> = {
  handloom: ShuttleIcon,
  pottery: PotterWheelIcon,
  bamboo: LeafIcon,
  woodwork: ChiselIcon,
  embroidery: NeedleIcon,
  painting: BrushIcon,
  default: CraftBoxIcon,
};
