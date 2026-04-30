import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Text, XStack, YStack } from "tamagui";
import { useAuth } from "../lib/authContext";
import { supabase } from "../lib/supabase";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  paddingLeft: 40,
  paddingRight: 40,
  paddingTop: 0,
  paddingBottom: 0,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
  backgroundColor: "white",
  color: "#111827",
  boxSizing: "border-box",
};

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.password) errors.password = "Please enter your password.";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const navState = location.state as
    | { justSignedUp?: boolean; email?: string }
    | null;
  const [values, setValues] = useState<FormState>({
    email: navState?.email ?? "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    navState?.justSignedUp
      ? "Account created. Log in with your new credentials to continue."
      : null,
  );

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      if (authError) setAuthError(null);
      if (notice) setNotice(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    setAuthError(null);
    try {
      await signIn(values.email.trim(), values.password);
      const { data } = await supabase
        .from("profiles")
        .select("current_grade, desired_profession")
        .maybeSingle();
      const ready =
        data?.current_grade && data?.desired_profession ? "/pathway" : "/onboarding";
      navigate(ready);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Could not log in. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <YStack
      minHeight="100vh"
      paddingVertical={48}
      paddingHorizontal={16}
      alignItems="center"
      justifyContent="center"
      style={{
        background:
          "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
      }}
    >
      <YStack
        width="100%"
        maxWidth={420}
        backgroundColor="white"
        borderRadius={16}
        padding={32}
        style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      >
        <YStack alignItems="center" marginBottom={24}>
          <YStack marginBottom={12}>
            <GraduationCap size={48} color="#2563eb" />
          </YStack>
          <Text fontSize={28} fontWeight="700" color="#111827" marginBottom={6}>
            Welcome back
          </Text>
          <Text fontSize={14} color="#6b7280" textAlign="center">
            Log in to continue your career journey.
          </Text>
        </YStack>

        {notice && (
          <XStack
            alignItems="center"
            gap={6}
            paddingHorizontal={12}
            paddingVertical={10}
            borderRadius={8}
            backgroundColor="#ecfdf5"
            marginBottom={16}
          >
            <Text fontSize={13} color="#047857">
              {notice}
            </Text>
          </XStack>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <YStack gap={16}>
            <Field
              label="Email address"
              error={errors.email}
              icon={<Mail size={18} color="#9ca3af" />}
            >
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange("email")}
                style={inputBaseStyle}
              />
            </Field>

            <Field
              label="Password"
              error={errors.password}
              icon={<Lock size={18} color="#9ca3af" />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={trailingButtonStyle}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#9ca3af" />
                  ) : (
                    <Eye size={18} color="#9ca3af" />
                  )}
                </button>
              }
            >
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={values.password}
                onChange={handleChange("password")}
                style={inputBaseStyle}
              />
            </Field>

            <XStack
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={8}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Remember me
              </label>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Text fontSize={13} fontWeight="600" color="#2563eb">
                  Forgot password?
                </Text>
              </Link>
            </XStack>

            {authError && (
              <XStack
                alignItems="center"
                gap={6}
                paddingHorizontal={12}
                paddingVertical={8}
                borderRadius={8}
                backgroundColor="#fef2f2"
              >
                <AlertCircle size={14} color="#dc2626" />
                <Text fontSize={12} color="#dc2626">
                  {authError}
                </Text>
              </XStack>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                height: 48,
                marginTop: 4,
                borderRadius: 8,
                border: "none",
                background: submitting
                  ? "#93c5fd"
                  : "linear-gradient(to right, #2563eb, #9333ea)",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </YStack>
        </form>

        <XStack
          marginTop={24}
          justifyContent="center"
          alignItems="center"
          gap={6}
        >
          <Text fontSize={14} color="#6b7280">
            New to CareerPathway?
          </Text>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <Text fontSize={14} fontWeight="600" color="#2563eb" cursor="pointer">
              Create an account
            </Text>
          </Link>
        </XStack>
      </YStack>
    </YStack>
  );
}

const trailingButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
};

function Field({
  label,
  error,
  icon,
  trailing,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <YStack gap={6}>
      <Text fontSize={13} fontWeight="600" color="#374151">
        {label}
      </Text>
      <YStack position="relative">
        {icon && (
          <YStack
            position="absolute"
            left={12}
            top="50%"
            zIndex={1}
            style={{ transform: "translateY(-50%)" }}
          >
            {icon}
          </YStack>
        )}
        {children}
        {trailing}
      </YStack>
      {error && (
        <XStack alignItems="center" gap={6}>
          <AlertCircle size={14} color="#dc2626" />
          <Text fontSize={12} color="#dc2626">
            {error}
          </Text>
        </XStack>
      )}
    </YStack>
  );
}
