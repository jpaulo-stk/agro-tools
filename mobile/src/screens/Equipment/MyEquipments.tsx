import { useEffect, useState } from "react";
import { View, Image, Alert, FlatList, Text } from "react-native";
import { deleteEquipment, listMyEquipments } from "../../services/equipments";
import {
  Screen,
  Title,
  Card,
  PrimaryButton,
  SecondaryButton,
  Small,
} from "../../components/ui";
import { formatBRL } from "../../utils/format";
import { useAuth } from "../../contexts/Auth";

export default function MyEquipments({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Sessão", "Faça login para ver seus itens.");
      navigation.navigate("Login");
    }
  }, [isAuthenticated]);

  async function load() {
    setLoading(true);
    try {
      const data = await listMyEquipments();
      setItems(data);
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.error || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    Alert.alert("Excluir", "Tem certeza?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEquipment(id);
            load();
          } catch (e: any) {
            Alert.alert("Erro", e?.response?.data?.error || "Falha ao excluir");
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <Title>Meus equipamentos</Title>
      <PrimaryButton title="Atualizar" onPress={load} />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ gap: 12, paddingTop: 12 }}
        renderItem={({ item }) => (
          <Card horizontal>
            {item.cover ? (
              <Image
                source={{ uri: item.cover }}
                style={{ width: 90, height: 70, borderRadius: 8 }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 70,
                  borderRadius: 8,
                  backgroundColor: "#eee",
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>
                {item.type} — {item.brand} {item.model}
              </Text>
              <Small muted>
                {item.city}
                {item.state ? `/${item.state}` : ""}
              </Small>
              <Small>{formatBRL(item.price)}</Small>
            </View>
            <SecondaryButton
              title="Excluir"
              onPress={() => onDelete(item.id)}
              danger
            />
          </Card>
        )}
        ListEmptyComponent={<Small muted>Nenhum item</Small>}
      />
    </Screen>
  );
}
