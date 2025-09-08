import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text } from "react-native";
import Explore from "../screens/Explore/Explore";
import EquipmentForm from "../screens/Equipment/Form";
import MyEquipments from "../screens/Equipment/MyEquipments";
import Profile from "../screens/Profile/Profile";
import { useAuth } from "../contexts/Auth";
import { colors } from "../theme/tokens";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
    >
      <View>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>AgroTools</Text>
          <Text style={{ color: colors.textMuted }}>
            {isAuthenticated ? "Sessão ativa" : "Convidado"}
          </Text>
        </View>

        <DrawerItem
          label="Explorar"
          onPress={() => props.navigation.navigate("Explore")}
        />

        {isAuthenticated && (
          <>
            <DrawerItem
              label="Cadastrar"
              onPress={() => props.navigation.navigate("NewEquipment")}
            />
            <DrawerItem
              label="Meus Equipamentos"
              onPress={() => props.navigation.navigate("MyEquipments")}
            />
            <DrawerItem
              label="Perfil"
              onPress={() => props.navigation.navigate("Profile")}
            />
          </>
        )}
      </View>

      <View>
        {isAuthenticated ? (
          <DrawerItem label="Sair" onPress={logout} />
        ) : (
          <>
            <DrawerItem
              label="Entrar"
              onPress={() => props.navigation.navigate("Login")}
            />
            <DrawerItem
              label="Criar conta"
              onPress={() => props.navigation.navigate("Register")}
            />
          </>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Explore"
      drawerContent={(p) => <CustomDrawerContent {...p} />}
    >
      <Drawer.Screen
        name="Explore"
        component={Explore}
        options={{ title: "Explorar" }}
      />
      <Drawer.Screen
        name="NewEquipment"
        component={EquipmentForm}
        options={{ title: "Cadastrar equipamento" }}
      />
      <Drawer.Screen
        name="MyEquipments"
        component={MyEquipments}
        options={{ title: "Meus equipamentos" }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Perfil" }}
      />
    </Drawer.Navigator>
  );
}
