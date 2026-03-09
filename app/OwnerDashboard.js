import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

import Home from "./Home";
import Fee from "./fee";
import Issues from "./issuesScreen";
import Profile from "./profile";

const Tab = createBottomTabNavigator();

export default function OwnerDashboard() {
return (
<Tab.Navigator
screenOptions={({ route }) => ({
headerShown: false,
tabBarActiveTintColor: COLORS.PRIMARY,
tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
tabBarStyle: {
height: 65,
paddingBottom: 8,
paddingTop: 8,
backgroundColor: COLORS.WHITE,
},
tabBarIcon: ({ color, size }) => {
let iconName;


      if (route.name === "Home") iconName = "home-outline";
      else if (route.name === "Fee") iconName = "card-outline";
      else if (route.name === "Issues") iconName = "warning-outline";
      else if (route.name === "Profile") iconName = "person-outline";

      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
>
  <Tab.Screen name="Home" component={Home} />
  <Tab.Screen name="Fee" component={Fee} />
  <Tab.Screen name="Issues" component={Issues} />
  <Tab.Screen name="Profile" component={Profile} />
</Tab.Navigator>


);
}
