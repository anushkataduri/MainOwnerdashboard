import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "./context/AppContext";
import OwnerDashboard from "./app/OwnerDashboard";

export default function App() {
return (
<GestureHandlerRootView style={{ flex: 1 }}> <AppProvider> <OwnerDashboard /> </AppProvider> </GestureHandlerRootView>
);
}
