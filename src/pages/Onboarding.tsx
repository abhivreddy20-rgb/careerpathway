import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, AlertCircle, Briefcase } from "lucide-react";
import { Text, XStack, YStack } from "tamagui";

type FormState = {
  currentGrade: string;
  desiredProfession: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const gradeOptions = [
  { value: "", label: "Select your current grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
  { value: "college", label: "College / University" },
  { value: "other", label: "Other" },
];

const professionSuggestions = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Designer",
  "Entrepreneur",
  "Lawyer",
  "Data Scientist",
  "Nurse",
];

const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  paddingLeft: 40,
  paddingRight: 12,
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
  if (!values.currentGrade) {
    errors.currentGrade = "Please select your current grade.";
  }
  if (!values.desiredProfession.trim()) {
    errors.desiredProfession = "Please share the profession you're aiming for.";
  }
  return errors;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>({
    currentGrade: "",
    desiredProfession: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof FormState, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
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
    localStorage.setItem(
      "cp:profile",
      JSON.stringify({
        currentGrade: values.currentGrade,
        desiredProfession: values.desiredProfession.trim(),
      }),
    );
    setSubmitting(false);
    navigate("/pathway");
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
        maxWidth={520}
        backgroundColor="white"
        borderRadius={16}
        padding={32}
        style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      >
        <YStack alignItems="center" marginBottom={24}>
          <YStack marginBottom={12}>
            <Compass size={48} color="#2563eb" />
          </YStack>
          <Text fontSize={28} fontWeight="700" color="#111827" marginBottom={6}>
            Let's personalize your path
          </Text>
          <Text
            fontSize={14}
            color="#6b7280"
            textAlign="center"
            maxWidth={420}
          >
            Tell us where you are today and where you're headed — we'll tailor
            your roadmap from there.
          </Text>
        </YStack>

        <form onSubmit={handleSubmit} noValidate>
          <YStack gap={20}>
            <Field label="Current grade" error={errors.currentGrade}>
              <select
                value={values.currentGrade}
                onChange={(e) => setField("currentGrade", e.target.value)}
                style={{
                  ...inputBaseStyle,
                  paddingLeft: 12,
                  appearance: "none",
                }}
              >
                {gradeOptions.map((o) => (
                  <option
                    key={o.value}
                    value={o.value}
                    disabled={o.value === ""}
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Desired profession"
              error={errors.desiredProfession}
              icon={<Briefcase size={18} color="#9ca3af" />}
            >
              <input
                type="text"
                list="profession-suggestions"
                placeholder="e.g. Software Engineer"
                value={values.desiredProfession}
                onChange={(e) => setField("desiredProfession", e.target.value)}
                style={inputBaseStyle}
              />
              <datalist id="profession-suggestions">
                {professionSuggestions.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>

            <XStack gap={8} flexWrap="wrap">
              {professionSuggestions.slice(0, 6).map((p) => {
                const active = values.desiredProfession === p;
                return (
                  <YStack
                    key={p}
                    onPress={() => setField("desiredProfession", p)}
                    paddingHorizontal={12}
                    paddingVertical={6}
                    borderRadius={9999}
                    borderWidth={1}
                    borderColor={active ? "#2563eb" : "#e5e7eb"}
                    backgroundColor={active ? "#eff6ff" : "white"}
                    hoverStyle={{
                      backgroundColor: active ? "#eff6ff" : "#f9fafb",
                    }}
                    cursor="pointer"
                  >
                    <Text
                      fontSize={12}
                      fontWeight="500"
                      color={active ? "#1d4ed8" : "#4b5563"}
                    >
                      {p}
                    </Text>
                  </YStack>
                );
              })}
            </XStack>

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
              {submitting ? "Saving…" : "Continue"}
            </button>
          </YStack>
        </form>
      </YStack>
    </YStack>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
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
