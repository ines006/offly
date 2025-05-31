import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";

const FlyAnimation = () => {
  const flyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flyAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flyAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = flyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Animated.Image
      source={require("../../imagens/fly.png")}
      style={[styles.fly, { transform: [{ translateY }] }]}
    />
  );
};

const styles = StyleSheet.create({
  fly: {
    position: "absolute",
    top: 50,
    right: 30,
    width: 60,
    height: 60,
    zIndex: 100,
  },
});

export default FlyAnimation;
