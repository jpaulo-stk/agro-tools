import { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  RefreshControl,
  FlatList,
} from "react-native";
import { listAll } from "../../services/explore";
import { Screen, Title, Card, Small, Loading } from "../../components/ui";
import { formatBRL } from "../../utils/format";

export default function Explore({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await listAll();
    setItems(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <Screen pad={false}>
      <View style={{ padding: 16 }}>
        <Title>Explorar</Title>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate("Details", { id: item.id })
            }
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
        )}
        ListEmptyComponent={<Small muted>Nenhum anúncio ainda</Small>}
      />
    </Screen>
  );
}
