import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { AuthScreen } from "../../../components/AuthScreen";

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const busy = fetchStatus === "fetching";
  const verifying = signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address");
  const fieldError = errors.fields.emailAddress?.message || errors.fields.password?.message || errors.fields.code?.message;

  async function createAccount() {
    setLocalError("");
    if (!validEmail(email)) return setLocalError("Enter a valid email address.");
    if (password.length < 8) return setLocalError("Choose a password with at least 8 characters.");
    if (password !== confirmPassword) return setLocalError("Your passwords don’t match.");

    const { error } = await signUp.password({ emailAddress: email.trim(), password });
    if (error) return setLocalError(error.message);
    if (signUp.status === "complete") return finishSignUp();
    const { error: codeError } = await signUp.verifications.sendEmailCode();
    if (codeError) setLocalError(codeError.message);
    else setNotice("We sent a verification code to your inbox.");
  }

  async function finishSignUp() {
    const { error } = await signUp.finalize();
    if (error) setLocalError(error.message);
    else router.replace("/(tabs)");
  }

  async function verifyEmail() {
    setLocalError("");
    if (!/^\d{6}$/.test(code.trim())) return setLocalError("Enter the 6-digit code from your email.");
    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) return setLocalError(error.message);
    if (signUp.status === "complete") await finishSignUp();
    else setLocalError("Your email is verified, but one more account detail is required. Please contact support.");
  }

  return (
    <AuthScreen
      title={verifying ? "Verify your email" : "A clearer view of your bills"}
      subtitle={verifying ? "Confirm your email to finish setting up your account." : "Create your account and bring every subscription together."}
    >
      <View className="auth-form">
        {verifying ? (
          <>
            <Text className="auth-helper">{notice || `We sent a 6-digit code to ${email.trim()}.`}</Text>
            <Text className="auth-label">Verification code</Text>
            <TextInput
              accessibilityLabel="Email verification code"
              className="auth-input"
              value={code}
              onChangeText={setCode}
              placeholder="Enter your code"
              placeholderTextColor="#59647a"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              editable={!busy}
            />
            {(localError || fieldError) ? <Text accessibilityRole="alert" className="auth-error">{localError || fieldError}</Text> : null}
            <Pressable className={`auth-button ${busy ? "auth-button-disabled" : ""}`} onPress={verifyEmail} disabled={busy} accessibilityRole="button">
              {busy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify email</Text>}
            </Pressable>
            <Pressable
              className="auth-text-button"
              onPress={async () => {
                setLocalError("");
                const { error } = await signUp.verifications.sendEmailCode();
                if (error) setLocalError(error.message);
                else setNotice("A fresh code has been sent to your inbox.");
              }}
              disabled={busy}
            >
              <Text className="auth-link">Resend code</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="auth-field">
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
                returnKeyType="next"
              />
            </View>
            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <View className="auth-password-wrap">
                <TextInput
                  accessibilityLabel="Create password"
                  className="auth-input auth-password-input"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#59647a"
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  editable={!busy}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)} accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} className="auth-password-toggle">
                  <Text className="auth-link">{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              </View>
              <Text className="auth-helper">Use 8 or more characters for a stronger password.</Text>
            </View>
            <View className="auth-field">
              <Text className="auth-label">Confirm password</Text>
              <TextInput
                accessibilityLabel="Confirm password"
                className="auth-input"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Enter your password again"
                placeholderTextColor="#59647a"
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="new-password"
                editable={!busy}
                returnKeyType="go"
                onSubmitEditing={createAccount}
              />
            </View>
            {(localError || fieldError) ? <Text accessibilityRole="alert" className="auth-error">{localError || fieldError}</Text> : null}
            <Pressable className={`auth-button ${busy ? "auth-button-disabled" : ""}`} onPress={createAccount} disabled={busy} accessibilityRole="button">
              {busy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Create account</Text>}
            </Pressable>
            <Text className="auth-legal">By continuing, you agree to receive a verification email to secure your account.</Text>
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already with Recurly?</Text>
              <Link href="/(auth)/sign-in" className="auth-link">Sign in</Link>
            </View>
            {/* Clerk's browser bot protection uses this target on web. */}
            <View nativeID="clerk-captcha" />
          </>
        )}
      </View>
    </AuthScreen>
  );
}
