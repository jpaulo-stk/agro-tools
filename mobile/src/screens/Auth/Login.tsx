import { useState } from "react";
import { Alert } from "react-native";
import { login, saveToken } from "../../services/auth";
import {
  Screen,
  Title,
  Label,
  Field,
  PrimaryButton,
  LinkText,
} from "../../components/ui";

import { useEffect } from "react";
import { ping } from "../../services/debug";
import { useAuth } from "../../contexts/Auth";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  useEffect(() => {
    ping();
  }, []);

  async function onSubmit() {
    try {
      setLoading(true);
      const { accessToken } = await login({ email, password });
      await loginWithToken(accessToken);
      navigation.replace("App");
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Falha no login";
      Alert.alert("Erro", String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Entrar</Title>

      <Label>Email</Label>
      <Field
        placeholder="seu@email.com"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Label>Senha</Label>
      <Field
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton
        title={loading ? "Entrando..." : "Entrar"}
        onPress={onSubmit}
      />

      <LinkText onPress={() => navigation.navigate("Register")}>
        Criar conta
      </LinkText>
    </Screen>
  );
}
