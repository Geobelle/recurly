import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthScreen } from "../../../components/AuthScreen";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfaStrategy, setMfaStrategy] = useState<
    "email_code" | "phone_code" | "totp" | "backup_code" | null
  >(null);
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const busy = fetchStatus === "fetching";
  const verifying =
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor";
  const fieldError =
    errors.fields.identifier?.message ||
    errors.fields.password?.message ||
    errors.fields.code?.message;

  async function finishSignIn() {
    const { error } = await signIn.finalize();
    if (error) setLocalError(error.message);
    else router.replace("/(tabs)");
  }

  async function submit() {
    setLocalError("");
    if (!validEmail(email))
      return setLocalError("Enter a valid email address.");
    if (!password) return setLocalError("Enter your password to continue.");
    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });
    if (error) return setLocalError(error.message);

    if (signIn.status === "complete") return finishSignIn();
    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (!emailCodeFactor) {
        setLocalError(
          "This sign-in needs another verification method. Please contact support.",
        );
        return;
      }
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) setLocalError(sendError.message);
      else {
        setMfaStrategy("email_code");
        setNotice("A secure sign-in code is on its way to your email.");
      }
    } else if (signIn.status === "needs_second_factor") {
      const strategies = signIn.supportedSecondFactors.map(
        (factor) => factor.strategy,
      );
      if (strategies.includes("totp")) setMfaStrategy("totp");
      else if (strategies.includes("email_code")) {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) setLocalError(sendError.message);
        else {
          setMfaStrategy("email_code");
          setNotice("A verification code is on its way to your email.");
        }
      } else if (strategies.includes("phone_code")) {
        const { error: sendError } = await signIn.mfa.sendPhoneCode();
        if (sendError) setLocalError(sendError.message);
        else {
          setMfaStrategy("phone_code");
          setNotice("A verification code is on its way to your phone.");
        }
      } else if (strategies.includes("backup_code"))
        setMfaStrategy("backup_code");
      else
        setLocalError(
          "Your account needs another verification method. Please contact support.",
        );
    } else {
      setLocalError("We couldn’t complete sign-in. Please try again.");
    }
  }

  async function verifyCode() {
    setLocalError("");
    if (
      mfaStrategy === "backup_code"
        ? !code.trim()
        : !/^\d{6}$/.test(code.trim())
    ) {
      return setLocalError(
        mfaStrategy === "backup_code"
          ? "Enter a backup code."
          : "Enter the 6-digit code from your email.",
      );
    }
    const result =
      mfaStrategy === "email_code"
        ? await signIn.mfa.verifyEmailCode({ code: code.trim() })
        : mfaStrategy === "phone_code"
          ? await signIn.mfa.verifyPhoneCode({ code: code.trim() })
          : mfaStrategy === "totp"
            ? await signIn.mfa.verifyTOTP({ code: code.trim() })
            : await signIn.mfa.verifyBackupCode({ code: code.trim() });
    const { error } = result;
    if (error) return setLocalError(error.message);
    if (signIn.status === "complete") await finishSignIn();
  }

  return (
    <AuthScreen
      title={verifying ? "One more step" : "Welcome back"}
      subtitle={
        verifying
          ? mfaStrategy === "totp"
            ? "Enter the code from your authenticator app."
            : mfaStrategy === "backup_code"
              ? "Enter one of your saved backup codes."
              : "Enter the secure code we sent to confirm it’s you."
          : "Sign in to keep your subscriptions in sync."
      }
    >
      <View className="auth-form">
        {verifying ? (
          <>
            <Text className="auth-label">
              {mfaStrategy === "totp"
                ? "Authenticator code"
                : mfaStrategy === "backup_code"
                  ? "Backup code"
                  : "Verification code"}
            </Text>
            <TextInput
              accessibilityLabel="Verification code"
              className="auth-input"
              value={code}
              onChangeText={setCode}
              placeholder="Enter your code"
              placeholderTextColor="#59647a"
              keyboardType={
                mfaStrategy === "backup_code" ? "default" : "number-pad"
              }
              textContentType={
                mfaStrategy === "backup_code" ? "none" : "oneTimeCode"
              }
              maxLength={mfaStrategy === "backup_code" ? 32 : 6}
              editable={!busy}
            />
            {!!notice && <Text className="auth-helper">{notice}</Text>}
            {localError || fieldError ? (
              <Text accessibilityRole="alert" className="auth-error">
                {localError || fieldError}
              </Text>
            ) : null}
            <Pressable
              className={`auth-button ${busy ? "auth-button-disabled" : ""}`}
              onPress={verifyCode}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Verify and continue</Text>
              )}
            </Pressable>
            {(mfaStrategy === "email_code" || mfaStrategy === "phone_code") && (
              <Pressable
                className="auth-text-button"
                onPress={async () => {
                  setLocalError("");
                  const { error } =
                    mfaStrategy === "phone_code"
                      ? await signIn.mfa.sendPhoneCode()
                      : await signIn.mfa.sendEmailCode();
                  if (error) setLocalError(error.message);
                  else setNotice("A fresh code has been sent.");
                }}
                disabled={busy}
              >
                <Text className="auth-link">Resend code</Text>
              </Pressable>
            )}
            {signIn.status === "needs_second_factor" &&
              signIn.supportedSecondFactors.some(
                (factor) => factor.strategy === "backup_code",
              ) &&
              signIn.supportedSecondFactors.some(
                (factor) => factor.strategy === "totp",
              ) && (
                <Pressable
                  className="auth-text-button"
                  onPress={() => {
                    setMfaStrategy(
                      mfaStrategy === "backup_code" ? "totp" : "backup_code",
                    );
                    setCode("");
                    setLocalError("");
                  }}
                >
                  <Text className="auth-link">
                    {mfaStrategy === "backup_code"
                      ? "Use authenticator code"
                      : "Use a backup code"}
                  </Text>
                </Pressable>
              )}
            {signIn.status === "needs_second_factor" &&
              signIn.supportedSecondFactors.some(
                (factor) => factor.strategy === "phone_code",
              ) &&
              mfaStrategy !== "phone_code" && (
                <Pressable
                  className="auth-text-button"
                  onPress={async () => {
                    setLocalError("");
                    const { error } = await signIn.mfa.sendPhoneCode();
                    if (error) setLocalError(error.message);
                    else {
                      setMfaStrategy("phone_code");
                      setCode("");
                      setNotice(
                        "A verification code is on its way to your phone.",
                      );
                    }
                  }}
                  disabled={busy}
                >
                  <Text className="auth-link">Use a text message instead</Text>
                </Pressable>
              )}
            {signIn.status === "needs_second_factor" &&
              signIn.supportedSecondFactors.some(
                (factor) => factor.strategy === "email_code",
              ) &&
              mfaStrategy !== "email_code" && (
                <Pressable
                  className="auth-text-button"
                  onPress={async () => {
                    setLocalError("");
                    const { error } = await signIn.mfa.sendEmailCode();
                    if (error) setLocalError(error.message);
                    else {
                      setMfaStrategy("email_code");
                      setCode("");
                      setNotice(
                        "A verification code is on its way to your email.",
                      );
                    }
                  }}
                  disabled={busy}
                >
                  <Text className="auth-link">Use an email code instead</Text>
                </Pressable>
              )}
            <Pressable
              className="auth-text-button"
              onPress={() => {
                signIn.reset();
                setCode("");
                setNotice("");
              }}
            >
              <Text className="auth-helper">Use a different account</Text>
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
              <View className="auth-label-row">
                <Text className="auth-label">Password</Text>
                <Link href="/(auth)/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </View>
              <View className="auth-password-wrap">
                <TextInput
                  accessibilityLabel="Password"
                  className="auth-input auth-password-input"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#59647a"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="current-password"
                  editable={!busy}
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="auth-password-toggle"
                >
                  <Text className="auth-link">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>
            {localError || fieldError ? (
              <Text accessibilityRole="alert" className="auth-error">
                {localError || fieldError}
              </Text>
            ) : null}
            <Pressable
              className={`auth-button ${busy ? "auth-button-disabled" : ""}`}
              onPress={submit}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>
            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up" className="auth-link">
                Create an account
              </Link>
            </View>
          </>
        )}
      </View>
    </AuthScreen>
  );
}
