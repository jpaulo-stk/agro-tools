import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  Screen,
  Title,
  Label,
  Field,
  PrimaryButton,
  Small,
} from "../../components/ui";
import { getMe, patchMe } from "../../services/users";
import { useAuth } from "../../contexts/Auth";

export default function Profile({ navigation }: any) {
  const { isAuthenticated, logout } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        Alert.alert("Sessão", "Faça login para acessar o perfil.");
        navigation.navigate("Login");
        return;
      }
      try {
        setLoading(true);
        const me = await getMe();
        setFullName(me.full_name || "");
        setPhone(me.phone || "");
        setEmail(me.email);
        setCpf(me.cpf);
      } catch (e: any) {
        Alert.alert(
          "Erro",
          e?.response?.data?.error || "Falha ao carregar perfil"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  async function onSave() {
    try {
      const updated = await patchMe({
        full_name: fullName,
        phone: phone || null,
      });
      Alert.alert("OK", "Perfil atualizado!");
      setFullName(updated.full_name || "");
      setPhone(updated.phone || "");
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.error || "Falha ao salvar");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <Screen>
      <Title>Perfil</Title>

      <Label>Nome completo</Label>
      <Field value={fullName} onChangeText={setFullName} />

      <Label>Telefone</Label>
      <Field value={phone} onChangeText={setPhone} placeholder="+55..." />

      <Label>Email</Label>
      <Field value={email} onChangeText={() => {}} style={{ opacity: 0.6 }} />
      <Small muted>O e-mail não pode ser alterado neste MVP</Small>

      <Label>CPF</Label>
      <Field value={cpf} onChangeText={() => {}} style={{ opacity: 0.6 }} />
      <Small muted>O CPF não pode ser alterado neste MVP</Small>

      <PrimaryButton
        title={loading ? "Carregando..." : "Salvar"}
        onPress={onSave}
      />
      <PrimaryButton title="Sair" onPress={logout} />
    </Screen>
  );
}
