import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "../context/AppContext";
import OwnerDashboard from "./OwnerDashboard";

export default function Index() {
return (
<GestureHandlerRootView style={{ flex: 1 }}> <AppProvider> <OwnerDashboard /> </AppProvider> </GestureHandlerRootView>
);
}
