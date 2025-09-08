import { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Alert, Text } from "react-native";
import { searchEquipments } from "../../services/search";
import {
  Screen,
  Title,
  Card,
  PrimaryButton,
  SecondaryButton,
  Small,
  Loading,
} from "../../components/ui";
import { formatBRL } from "../../utils/format";

export default function ResultsScreen({ route, navigation }: any) {
  const [state, setState] = useState({
    loading: true,
    items: [] as any[],
    page: 1,
    totalPages: 1,
  });

  async function load(p = route.params?.page || 1) {
    try {
      setState((s) => ({ ...s, loading: true }));
      const { city, type, minPrice, maxPrice } = route.params || {};
      const res = await searchEquipments({
        city,
        type,
        minPrice,
        maxPrice,
        page: p,
        pageSize: 10,
      });
      setState({
        loading: false,
        items: res.data,
        page: res.page,
        totalPages: res.totalPages,
      });
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.error || "Falha na busca");
      setState((s) => ({ ...s, loading: false }));
    }
  }
  useEffect(() => {
    load();
  }, []);

  if (state.loading) return <Loading />;

  return (
    <Screen>
      <Title>Resultados</Title>

      <View style={{ gap: 12 }}>
        {state.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate("Details", { id: item.id })}
          >
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
            </Card>
          </TouchableOpacity>
        ))}
        {state.items.length === 0 && <Small muted>Nenhum resultado</Small>}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <SecondaryButton
          title="Anterior"
          onPress={() => load(Math.max(1, state.page - 1))}
        />
        <Small muted>
          Página {state.page} / {state.totalPages}
        </Small>
        <SecondaryButton
          title="Próxima"
          onPress={() => load(Math.min(state.totalPages, state.page + 1))}
        />
      </View>
    </Screen>
  );
}
