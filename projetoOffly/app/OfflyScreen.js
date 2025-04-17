import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function OfflyScreen() {
  const [logoScaleAnim] = useState(new Animated.Value(0));
  const [textScaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(logoScaleAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(textScaleAnim, {
      toValue: 1,
      duration: 1500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, [logoScaleAnim, textScaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logoo.png")}
        style={[styles.logo, { transform: [{ scale: logoScaleAnim }] }]}
      />
      <Animated.Text
        style={[styles.title, { transform: [{ scale: textScaleAnim }] }]}
      >
        OFFLY
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: "#283B8B",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    color: "#A7C8FF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
});
