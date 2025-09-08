import { ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing, radii, typography } from "../theme/tokens";

export function Screen(props: {
  children: ReactNode;
  scroll?: boolean;
  pad?: boolean;
}) {
  const inner = (
    <View style={[styles.container, props.pad !== false && styles.pad]}>
      {props.children}
    </View>
  );
  if (props.scroll) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            props.pad !== false && styles.pad,
          ]}
        >
          {props.children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  return inner;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

type FieldProps = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: any;
};

export function Field(props: FieldProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textMuted}
      style={[
        styles.input,
        props.multiline && styles.inputMultiline,
        props.style,
      ]}
    />
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={styles.btnText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  danger,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnOutline,
        {
          opacity: pressed ? 0.85 : 1,
          borderColor: danger ? colors.danger : colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.btnOutlineText,
          { color: danger ? colors.danger : colors.primary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function LinkText({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Text onPress={onPress} style={styles.link}>
      {children}
    </Text>
  );
}

export function Card({
  children,
  horizontal,
}: {
  children: ReactNode;
  horizontal?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        horizontal && {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Small({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Text style={[styles.small, muted && { color: colors.textMuted }]}>
      {children}
    </Text>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg },
  pad: { padding: spacing.lg, gap: spacing.md },
  title: {
    fontSize: typography.h1,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.small,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: "top" },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700", fontSize: typography.body },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  btnOutlineText: { fontWeight: "700", fontSize: typography.body },
  link: { color: colors.primary, textAlign: "center", marginTop: spacing.sm },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  small: { fontSize: typography.small, color: colors.text },
});
