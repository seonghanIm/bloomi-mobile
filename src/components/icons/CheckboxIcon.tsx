import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface CheckboxIconProps {
  checked: boolean;
  size?: number;
}

export default function CheckboxIcon({ checked, size = 24 }: CheckboxIconProps) {
  if (checked) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect width="24" height="24" rx="4" fill="#88DC00" />
        <Path
          d="M7 12.5L10.5 16L17 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="3.5"
        stroke="#D1D1D6"
        fill="white"
      />
    </Svg>
  );
}