import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { AuthScreen } from "../../../components/AuthScreen";

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPassword() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const busy = fetchStatus === "fetching";
  const resetPassword = signIn.status === "needs_new_password";

  async function sendCode() {
    setLocalError("");
    if (!validEmail(email)) return setLocalError("Enter the email address for your account.");
    const { error: createError } = await signIn.create({ identifier: email.trim() });
    if (createError) return setLocalError(createError.message);
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) return setLocalError(error.message);
    setCodeSent(true);
  }

  async function verifyCode() {
    setLocalError("");
    if (!code.trim()) return setLocalError("Enter the code we sent to your email.");
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (error) setLocalError(error.message);
  }

  async function setNewPassword() {
    setLocalError("");
    if (password.length < 8) return setLocalError("Choose a password with at least 8 characters.");
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });
    if (error) return setLocalError(error.message);
    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) setLocalError(finalizeError.message);
      else router.replace("/(tabs)");
    }
  }

  const title = resetPassword ? "Choose a new password" : codeSent ? "Check your email" : "Reset your password";
  const subtitle = resetPassword
    ? "Choose a new password to secure your Recurly account."
    : codeSent
      ? `Enter the reset code sent to ${email.trim()}.`
      : "We’ll send you a secure code to get back into your account.";

  return (
    <AuthScreen title={title} subtitle={subtitle}>
      <View className="auth-form">
        {!codeSent ? (
          <>
            <Text className="auth-label">Email</Text>
            <TextInput
              accessibilityLabel="Email address"
              className="auth-input"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#59647a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              editable={!busy}
            />
          </>
        ) : resetPassword ? (
          <>
            <Text className="auth-label">New password</Text>
            <TextInput
              accessibilityLabel="New password"
              className="auth-input"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor="#59647a"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              editable={!busy}
            />
          </>
        ) : (
          <>
            <Text className="auth-label">Password reset code</Text>
            <TextInput
              accessibilityLabel="Password reset code"
              className="auth-input"
              value={code}
              onChangeText={setCode}
              placeholder="Enter your code"
              placeholderTextColor="#59647a"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              editable={!busy}
            />
          </>
        )}
        {(localError || errors.fields.identifier?.message || errors.fields.code?.message || errors.fields.password?.message) ? (
          <Text accessibilityRole="alert" className="auth-error">
            {localError || errors.fields.identifier?.message || errors.fields.code?.message || errors.fields.password?.message}
          </Text>
        ) : null}
        <Pressable
          className={`auth-button ${busy ? "auth-button-disabled" : ""}`}
          onPress={resetPassword ? setNewPassword : codeSent ? verifyCode : sendCode}
          disabled={busy}
          accessibilityRole="button"
        >
          {busy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">{resetPassword ? "Save new password" : codeSent ? "Verify code" : "Send reset code"}</Text>}
        </Pressable>
        <View className="auth-link-row">
          <Text className="auth-link-copy">Remembered it?</Text>
          <Link href="/(auth)/sign-in" className="auth-link">Back to sign in</Link>
        </View>
      </View>
    </AuthScreen>
  );
}
