// components/CurvedTabBarBackground.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const CurvedTabBarBackground = () => {
  const height = 80;
  const curveWidth = 150;
  const curveRadius = 40;

  const path = `
    M0,0
    H${(width - curveWidth) / 2}
    C${(width - curveWidth) / 2 + 10},0 ${(width - curveWidth) / 2 + 15},${height} ${width / 2},${height}
    C${(width + curveWidth) / 2 - 15},${height} ${(width + curveWidth) / 2 - 10},0 ${(width + curveWidth) / 2},0
    H${width}
    V${height}
    H0
    Z
  `;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} style={styles.svg}>
        <Path fill="#1c1c1e" d={path} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
  },
});

export default CurvedTabBarBackground;
