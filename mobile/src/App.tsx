import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppDrawer from "./navigation/AppDrawer";
import LoginScreen from "./screens/Auth/Login";
import RegisterScreen from "./screens/Auth/Register";
import DetailsScreen from "./screens/Search/Details";

import { AuthProvider } from "./contexts/Auth";

const Stack = createNativeStackNavigator();
const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="App"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="App" component={AppDrawer} />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={{ headerShown: true, title: "Detalhes" }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: true, title: "Entrar" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: true, title: "Criar conta" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
