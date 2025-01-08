import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import PodioPontuacao from './leaderboard/podio';
// import Shake from './shake/shake';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabWidth = SCREEN_WIDTH / state.routes.length;
  const insets = useSafeAreaInsets();
  const tabBarHeight = SCREEN_HEIGHT * 0.07 + insets.bottom;

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
    <View style={[styles.tabBarContainer, { height: "7%"}]}>
      <Svg
        width={SCREEN_WIDTH}
        height={tabBarHeight}
      >
        <Path fill="#263A83" d={getPath(state.index)} />
      </Svg>

      <View style={styles.tabIcons}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
              ? options.title
              : typeof route.name === 'string'
              ? route.name
              : '';

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
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
                <View style={[styles.inactiveIcon,  { bottom: tabBarHeight * (-0.15) }]}>
                  <Icon name={options.tabBarIcon} size={30} color="#fff" />
                  {label !== '' && <Text style={styles.iconLabel}>{label}</Text>}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const HomeScreen = () => (
    <View style={[styles.screen, { paddingBottom: SCREEN_HEIGHT * 0.1 }]}>
      <Text>Home Screen</Text>
    </View>
  );

  const TorneioScreen = () => (
    <View style={[styles.screen, { paddingBottom: SCREEN_HEIGHT * 0.1 }]}>
      <PodioPontuacao/>
    </View>
  );

const ShakeScreen = () => (
  <View style={[styles.screen, { paddingBottom: SCREEN_HEIGHT * 0.1 }]}>
    <Shake/>
  </View>
);

export default function Navbar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon:
          route.name === 'Home'
            ? 'home'
            : route.name === 'Torneio'
            ? 'trophy'
            : 'cellphone',
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Torneio" component={TorneioScreen} />
      <Tab.Screen name="Shake" component={ShakeScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      bottom: 0,
    },
    tabBarContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: 'transparent',
      zIndex: 10,
      padding: 0, 
      margin: 0,  
    },
    svg: {
      position: 'absolute',
      bottom: 0,
      left: 0,    
      right: 0,   
    },
    tabIcons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      position: 'absolute',
      bottom: 0,
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 0,
    },
    activeCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#263A83',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inactiveIcon: {
      alignItems: 'center',
    },
    iconLabel: {
      color: '#fff',
      fontSize: 12,
      marginTop: 4,
    },
  });
  