import { useState } from "react";
import { Alert } from "react-native";
import { register, saveToken } from "../../services/auth";
import {
  Screen,
  Title,
  Label,
  Field,
  PrimaryButton,
} from "../../components/ui";
import { useAuth } from "../../contexts/Auth";

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();

  async function onSubmit() {
    try {
      setLoading(true);
      const { accessToken } = await register({
        fullName,
        email,
        cpf,
        password,
        phone,
      });
      await loginWithToken(accessToken);
      navigation.replace("App");
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Falha no cadastro";
      Alert.alert("Erro", String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Title>Criar conta</Title>

      <Label>Nome completo</Label>
      <Field
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ex.: Maria Silva"
      />

      <Label>Email</Label>
      <Field
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="seu@email.com"
      />

      <Label>CPF</Label>
      <Field
        value={cpf}
        onChangeText={setCpf}
        keyboardType="number-pad"
        placeholder="Somente números"
      />

      <Label>Telefone (opcional)</Label>
      <Field value={phone} onChangeText={setPhone} placeholder="+55..." />

      <Label>Senha</Label>
      <Field
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <PrimaryButton
        title={loading ? "Criando..." : "Criar conta"}
        onPress={onSubmit}
      />
    </Screen>
  );
}
