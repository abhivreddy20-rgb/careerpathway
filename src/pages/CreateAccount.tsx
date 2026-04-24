import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Text, XStack, YStack } from "tamagui";

type FormState = {
  name: string;
  email: string;
  gradeLevel: string;
  password: string;
  confirmPassword: string;
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
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.gradeLevel) errors.gradeLevel = "Please select your grade level.";
  if (!values.password) {
    errors.password = "Please choose a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords don't match.";
  }
  return errors;
}

export default function CreateAccount() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>({
    name: "",
    email: "",
    gradeLevel: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    navigate("/onboarding");
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
        maxWidth={460}
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
            Create your account
          </Text>
          <Text fontSize={14} color="#6b7280" textAlign="center">
            Start your personalized career journey today.
          </Text>
        </YStack>

        <form onSubmit={handleSubmit} noValidate>
          <YStack gap={16}>
            <Field
              label="Full name"
              error={errors.name}
              icon={<User size={18} color="#9ca3af" />}
            >
              <input
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={values.name}
                onChange={handleChange("name")}
                style={inputBaseStyle}
              />
            </Field>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={values.password}
                onChange={handleChange("password")}
                style={inputBaseStyle}
              />
            </Field>

            <Field
              label="Confirm password"
              error={errors.confirmPassword}
              icon={<Lock size={18} color="#9ca3af" />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  style={trailingButtonStyle}
                >
                  {showConfirm ? (
                    <EyeOff size={18} color="#9ca3af" />
                  ) : (
                    <Eye size={18} color="#9ca3af" />
                  )}
                </button>
              }
            >
              <input
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChange={handleChange("confirmPassword")}
                style={inputBaseStyle}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                height: 48,
                marginTop: 8,
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
              {submitting ? "Creating account…" : "Create account"}
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
            Already have an account?
          </Text>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Text
              fontSize={14}
              fontWeight="600"
              color="#2563eb"
              cursor="pointer"
            >
              Log in
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
