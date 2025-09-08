import { useState } from "react";
import { Alert } from "react-native";
import {
  Screen,
  Title,
  Label,
  Field,
  PrimaryButton,
  Small,
} from "../../components/ui";

export default function SearchScreen({ navigation }: any) {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function onSubmit() {
    if (!city.trim()) return Alert.alert("Cidade", "Informe a cidade");
    navigation.navigate("Results", {
      city: city.trim(),
      type: type || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
    });
  }

  return (
    <Screen>
      <Title>Buscar equipamentos</Title>

      <Label>Cidade</Label>
      <Field
        value={city}
        onChangeText={setCity}
        placeholder="Ex.: Campo Mourão"
      />

      <Label>Tipo (opcional)</Label>
      <Small muted>colheitadeira | trator | pulverizador | plantadeira</Small>
      <Field
        value={type}
        onChangeText={setType}
        autoCapitalize="none"
        placeholder="Ex.: trator"
      />

      <Label>Preço mín (opcional)</Label>
      <Field
        value={minPrice}
        onChangeText={setMinPrice}
        keyboardType="decimal-pad"
      />

      <Label>Preço máx (opcional)</Label>
      <Field
        value={maxPrice}
        onChangeText={setMaxPrice}
        keyboardType="decimal-pad"
      />

      <PrimaryButton title="Buscar" onPress={onSubmit} />
    </Screen>
  );
}
