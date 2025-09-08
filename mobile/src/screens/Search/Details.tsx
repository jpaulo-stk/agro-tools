import { useEffect, useState } from "react";
import { Image, ScrollView, Alert, Linking, View, Text } from "react-native";
import Constants from "expo-constants";
import { getEquipmentDetail } from "../../services/search";
import {
  Screen,
  Title,
  PrimaryButton,
  Small,
  Loading,
  Card,
} from "../../components/ui";
import { formatBRL } from "../../utils/format";

const digits = (s?: string) => (s || "").replace(/\D/g, "");

export default function DetailsScreen({ route }: any) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getEquipmentDetail(route.params.id);
        setItem(d);
      } catch (e: any) {
        Alert.alert("Erro", e?.response?.data?.error || "Falha ao carregar");
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.id]);

  async function contactWhatsApp() {
    if (!item?.owner_phone)
      return Alert.alert(
        "Contato",
        "Este anúncio não tem telefone cadastrado."
      );
    const cc = ((Constants?.expoConfig?.extra as any)?.WHATSAPP_CC ||
      "55") as string;
    const phone = digits(item.owner_phone);
    const msg = `Olá! Tenho interesse no equipamento ${item.type} ${item.brand} ${item.model} em ${item.city}. ID: ${item.id}. Podemos conversar?`;
    const url = `https://wa.me/${cc}${phone}?text=${encodeURIComponent(msg)}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok)
      return Alert.alert("WhatsApp", "Não foi possível abrir o WhatsApp.");
    Linking.openURL(url);
  }

  if (loading) return <Loading />;
  if (!item)
    return (
      <Screen>
        <Small>Não encontrado</Small>
      </Screen>
    );

  return (
    <Screen scroll>
      <Title>
        {item.type} — {item.brand} {item.model}
      </Title>
      <Small muted>
        {item.city}
        {item.state ? `/${item.state}` : ""}
      </Small>
      <Small>{formatBRL(item.price)}</Small>
      <Small>Condição: {item.condition}</Small>
      {item.description ? <Small>{item.description}</Small> : null}

      <Card>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(item.photos || []).map((p: any) => (
            <Image
              key={p.id}
              source={{ uri: p.url }}
              style={{
                width: 220,
                height: 160,
                borderRadius: 10,
                marginRight: 10,
              }}
            />
          ))}
        </ScrollView>
      </Card>

      <PrimaryButton title="Contatar via WhatsApp" onPress={contactWhatsApp} />
    </Screen>
  );
}
