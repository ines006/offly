import React, { useContext, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

import Home from "./pag-principal-lg/pag-principal-lg";
import PodioPontuacao from "./leaderboard/podio";
import ShakeScreen from "./shake/shakeScreen";

import { AuthContext } from "../components/entrar/AuthContext";
import { baseurl } from "../api-config/apiConfig";

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabWidth = SCREEN_WIDTH / state.routes.length;
  const insets = useSafeAreaInsets();
  const tabBarHeight = Math.max(SCREEN_HEIGHT * 0.06, 20) + insets.bottom;

  const getPath = (index) => {
    const centerX = tabWidth * (index + 0.5);
    const curveRadius = tabWidth * 0.6;

    return `
      M 90 0 
      H ${centerX - curveRadius} 
      C ${centerX - curveRadius / 2} 0 ${centerX - curveRadius / 2} ${tabBarHeight * 0.57} ${centerX} ${tabBarHeight * 0.57}
      C ${centerX + curveRadius / 2} ${tabBarHeight * 0.57} ${centerX + curveRadius / 2} 0 ${centerX + curveRadius} 0
      H ${SCREEN_WIDTH}
      Q ${SCREEN_WIDTH} 0 ${SCREEN_WIDTH} 15
      V ${tabBarHeight}
      Q ${SCREEN_WIDTH} ${tabBarHeight} ${SCREEN_WIDTH - 15} ${tabBarHeight}
      H 15
      Q 0 ${tabBarHeight} 0 ${tabBarHeight}
      V -12
      Q 0 0 15 0
      Z 
    `;
  };

  return (
    <View style={[styles.tabBarContainer, { height: tabBarHeight }]}>
      <Svg width={SCREEN_WIDTH} height={tabBarHeight}>
        <Path fill="#263A83" d={getPath(state.index)} />
      </Svg>

      <View style={styles.tabIcons}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options.title === "string"
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[styles.tabIconContainer, { width: tabWidth }]}
            >
              {isFocused ? (
                <View style={[styles.activeCircle, { bottom: tabBarHeight * 0.15 }]}>
                  <Icon name={options.tabBarIcon} size={40} color="#C0E862" />
                </View>
              ) : (
                <View style={[styles.inactiveIcon, { bottom: tabBarHeight * -0.05 }]}>
                  <Icon name={options.tabBarIcon} size={30} color="#fff" />
                  {label && <Text style={styles.iconLabel}>{label}</Text>}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function Navbar() {
  const { user, loading } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [touchId, setTouchId] = useState(null);

  useEffect(() => {
    if (loading || !user?.id) return;

    const checkForTouch = async () => {
      try {
        const res = await axios.get(`${baseurl}/touchs/receiver/${user.id}`);
        const today = new Date().toISOString().split("T")[0];

        const validTouch = res.data.find(
          (touch) =>
            touch.active === true && touch.fly_date.split("T")[0] === today
        );

        if (validTouch) {
          setTouchId(validTouch.id);
          const senderRes = await axios.get(`${baseurl}/participants/${validTouch.sender_id}`);
          setSenderName(senderRes.data.name || "Outro utilizador");
          setShowPopup(true);
        }
      } catch (err) {
      }
    };

    checkForTouch();
  }, [loading, user]);

  const handleConfirm = async () => {
    try {
      await axios.put(`${baseurl}/api/touchs/${touchId}/desativar`);
      setShowPopup(false);
    } catch (err) {
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon:
            route.name === "Home"
              ? "home"
              : route.name === "Torneio"
              ? "trophy"
              : "cellphone",
        })}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Torneio" component={PodioPontuacao} />
        <Tab.Screen name="Shake" component={ShakeScreen} />
      </Tab.Navigator>

      <Modal visible={showPopup} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.newModalContent}>
          <Text style={styles.newModalTitle}>🚀 FLY FLY FLY </Text>
          <Text style={styles.pointsText}>
            <Text style={styles.senderName}>{senderName}</Text> está a desafiar-te para fazeres o teu desafio.{"\n"}
          </Text>
          <Text> Será que és melhor do que ele? </Text>
          <Text style={styles.motivationalText}>Mostra do que és capaz! 💪</Text>

          <Pressable style={styles.newConfirmButton} onPress={handleConfirm}>
            <Text style={styles.newConfirmButtonText}>Recebido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "transparent",
    zIndex: 10,
  },
  tabIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "absolute",
    bottom: 0,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
  },
  activeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#263A83",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  inactiveIcon: {
    alignItems: "center",
  },
  iconLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
},

newModalContent: {
  backgroundColor: "#C0E862", 
  borderRadius: 20,
  padding: 30,
  width: "85%",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 10,
},

newModalTitle: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#263A83",
  marginBottom: 15,
  textAlign: "center",
},

pointsText: {
  fontSize: 16,
  color: "#263A83",
  textAlign: "center",
  marginBottom: 15,
},

motivationalText: {
  fontSize: 18,
  fontStyle: "italic",
  fontWeight: "600",
  color: "#1A3E1A",
  marginBottom: 20,
  textAlign: "center",
},

senderName: {
  fontWeight: "bold",
  color: "#1A3E1A",
},

newConfirmButton: {
  backgroundColor: "#263a83", 
  paddingVertical: 12,
  paddingHorizontal: 35,
  borderRadius: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
},

newConfirmButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},
});
