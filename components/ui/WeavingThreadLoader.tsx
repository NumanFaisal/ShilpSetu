import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface WeavingThreadLoaderProps {
  size?: number;
  color?: string;
  label?: string;
}

/**
 * WeavingThreadLoader — Custom animated progress indicator.
 * A thread that weaves through loom pegs, representing the craft creation process.
 * Replaces generic ActivityIndicator for all AI processing screens.
 */
export const WeavingThreadLoader: React.FC<WeavingThreadLoaderProps> = ({
  size = 80,
  color = '#B5502F',
}) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const loop1 = createLoop(anim1, 0);
    const loop2 = createLoop(anim2, 200);
    const loop3 = createLoop(anim3, 400);

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, []);

  const translateY1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const translateY2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const translateY3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  const dotSize = size * 0.12;
  const spacing = size * 0.3;

  return (
    <View
      style={{
        width: size * 1.2,
        height: size * 0.6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing,
      }}
    >
      {[translateY1, translateY2, translateY3].map((ty, i) => (
        <Animated.View
          key={i}
          style={[
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
            },
            { transform: [{ translateY: ty }] },
          ]}
        />
      ))}
      {/* Weaving line connecting the dots */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.15,
          left: size * 0.05,
          right: size * 0.05,
          height: 1.5,
          backgroundColor: color,
          opacity: 0.3,
        }}
      />
    </View>
  );
};

// Full-screen AI processing state
interface AIProcessingScreenProps {
  title: string;
  subtitle?: string;
  steps?: string[];
  currentStep?: number;
}

export const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  title,
  subtitle,
  steps = [],
  currentStep = 0,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFF8F6',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}
    >
      <WeavingThreadLoader size={80} color="#B5502F" />

      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Animated.Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 24,
            lineHeight: 32,
            color: '#2B2420',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          {title}
        </Animated.Text>
        {subtitle && (
          <Animated.Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              lineHeight: 22,
              color: '#56423C',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>

      {steps.length > 0 && (
        <View style={{ width: '100%', gap: 12 }}>
          {steps.map((step, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: i <= currentStep ? 1 : 0.35,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: i < currentStep ? '#B5502F' : i === currentStep ? '#FFF8F6' : '#FFF8F6',
                  borderWidth: 1.5,
                  borderColor: i <= currentStep ? '#B5502F' : '#E4D8C3',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i < currentStep && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />
                )}
                {i === currentStep && (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#B5502F' }} />
                )}
              </View>
              <Animated.Text
                style={{
                  fontFamily: i === currentStep ? 'Inter_500Medium' : 'Inter_400Regular',
                  fontSize: 14,
                  color: i <= currentStep ? '#2B2420' : '#8A726B',
                }}
              >
                {step}
              </Animated.Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
