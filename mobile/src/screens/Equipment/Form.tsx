import { useState } from "react";
import { Alert, Image, ScrollView, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createEquipment } from "../../services/equipments";
import {
  Screen,
  Title,
  Label,
  Field,
  PrimaryButton,
  SecondaryButton,
  Card,
  Small,
} from "../../components/ui";
import { useAuth } from "../../contexts/Auth";
import { useEffect } from "react";

1;
export default function EquipmentForm({ navigation }: any) {
  const [type, setType] = useState<
    "colheitadeira" | "trator" | "pulverizador" | "plantadeira"
  >("trator");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [condition, setCondition] = useState("Bom");
  const [price, setPrice] = useState<string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("PR");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Sessão", "Faça login para cadastrar.");
      navigation.navigate("Login");
    }
  }, [isAuthenticated]);

  async function pickImages() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted)
      return Alert.alert("Permissão", "Conceda acesso às fotos.");
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled)
      setImages((prev) => [
        ...prev,
        ...res.assets.map((a) => ({ uri: a.uri })),
      ]);
  }

  async function onSubmit() {
    try {
      setLoading(true);
      if (!images.length)
        return Alert.alert("Fotos", "Envie pelo menos 1 foto");
      const payload = {
        type,
        brand,
        model,
        year: year ? Number(year) : undefined,
        condition,
        price: Number(price || 0),
        city,
        state,
        description: description || undefined,
      };
      await createEquipment(payload, images);
      Alert.alert("Sucesso", "Equipamento cadastrado!");
      navigation.goBack();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error || e?.message || "Falha ao cadastrar";
      Alert.alert("Erro", String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Title>Novo equipamento</Title>

      <Label>Tipo (trator/colheitadeira/pulverizador/plantadeira)</Label>
      <Field value={type} onChangeText={(t) => setType(t as any)} />

      <Label>Marca</Label>
      <Field value={brand} onChangeText={setBrand} />

      <Label>Modelo</Label>
      <Field value={model} onChangeText={setModel} />

      <Label>Ano</Label>
      <Field value={year} onChangeText={setYear} keyboardType="number-pad" />

      <Label>Condição</Label>
      <Field value={condition} onChangeText={setCondition} />

      <Label>Preço (por dia)</Label>
      <Field value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      <Label>Cidade</Label>
      <Field value={city} onChangeText={setCity} />

      <Label>UF</Label>
      <Field value={state} onChangeText={setState} maxLength={2} />

      <Label>Descrição</Label>
      <Field
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Small muted>Adicione fotos (mín. 1, máx. 5)</Small>
          <SecondaryButton title="Selecionar fotos" onPress={pickImages} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >
          {images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.uri }}
              style={{ width: 96, height: 96, borderRadius: 8, marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </Card>

      <PrimaryButton
        title={loading ? "Enviando..." : "Salvar"}
        onPress={onSubmit}
      />
    </Screen>
  );
}
