import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Card() {
  const handleCirclePress = () => {
    console.log("Circle button clicked!");
    // Add any functionality you want here
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left Icon */}
        <View style={styles.iconContainer}>
          <FontAwesome name="plane" size={20} color="#34459E" />
        </View>

        <Text style={styles.teamName}>Equipa K</Text>

        <Text style={styles.points}>
          <FontAwesome name="star" size={12} color="#D4F34A" /> 1200 pontos
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statText}>Dias em competição</Text>
          <Text style={styles.statValue}>
            9/30 <FontAwesome name="calendar" size={14} color="#ffffff" />
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>Desafios completos</Text>
          <Text style={styles.statValue}>
            7/30 <FontAwesome name="image" size={14} color="#ffffff" />
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>5/5</Text>
        <FontAwesome name="group" size={16} color="#ffffff" />
      </View>

      {/* Circle Button at the Bottom Center */}
      <TouchableOpacity style={styles.bottomCircle} onPress={handleCirclePress}>
        <FontAwesome name="image" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#27368F",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    alignSelf: "center",
    marginVertical: 20,
    position: "relative", // Necessary for positioning the circle
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 50,
    height: 32,
    width: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  teamName: {
    fontSize: 17,
    color: "#27368F",
    fontWeight: "bold",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  points: {
    fontSize: 16,
    color: "#D4F34A",
    fontWeight: "bold",
  },

//   stats: {
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },

  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 2,
    padding: 10,
    margin: 10,

  },
  statText: {
    fontSize: 14,
    color: "#ffffff",
  },
  statValue: {
    fontSize: 14,
    color: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "right",
    marginRight: 10,
    flex: 1,
  },
  bottomCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#27368F",
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -32,
    alignSelf: "center",
  },
});
