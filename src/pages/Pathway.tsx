import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Heart,
  Sparkles,
  Plus,
  Check,
  Trash2,
} from "lucide-react";
import { Text, XStack, YStack } from "tamagui";
import {
  itemId,
  type GradePlan,
  type PathwayCategory,
  type PathwayTrack,
} from "../data/pathway";
import { useAuth } from "../lib/authContext";
import {
  fetchProfile,
  loadPathway,
  saveCompletedItems,
  saveCustomItems,
  suggestSkills,
  type CustomItem,
  type SuggestedSkill,
} from "../lib/api";

const TAB_META: {
  key: PathwayCategory;
  label: string;
  Icon: typeof BookOpen;
  recommendedLabel: string;
}[] = [
  { key: "courses", label: "Courses", Icon: BookOpen, recommendedLabel: "RECOMMENDED COURSES" },
  { key: "activities", label: "Activities", Icon: Users, recommendedLabel: "RECOMMENDED ACTIVITIES" },
  { key: "volunteer", label: "Volunteer", Icon: Heart, recommendedLabel: "RECOMMENDED VOLUNTEER WORK" },
  { key: "skills", label: "Skills", Icon: Sparkles, recommendedLabel: "RECOMMENDED SKILLS" },
];

export default function Pathway() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profession, setProfession] = useState("");
  const [track, setTrack] = useState<PathwayTrack>("General");
  const [plans, setPlans] = useState<GradePlan[]>([]);
  const [source, setSource] = useState<"openai" | "fallback">("fallback");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<CustomItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [liveSkills, setLiveSkills] = useState<SuggestedSkill[]>([]);
  const [skillsSource, setSkillsSource] = useState<
    "onet" | "cache" | "onet_unconfigured" | "no_match" | null
  >(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const profile = await fetchProfile();
      if (!profile?.current_grade || !profile?.desired_profession) {
        navigate("/onboarding", { replace: true });
        return;
      }
      const bundle = await loadPathway(
        profile.current_grade,
        profile.desired_profession,
      );
      if (cancelled) return;
      setProfession(profile.desired_profession);
      setTrack(bundle.track);
      setPlans(bundle.plans);
      setSource(bundle.source);
      setDone(new Set(profile.completed_items));
      setCustom(profile.custom_items);
      setLoading(false);

      // Fire-and-forget: enrich the page with live O*NET skills.
      // Failure here must not block the rest of the pathway from rendering.
      suggestSkills({ profession: profile.desired_profession })
        .then((res) => {
          if (cancelled || !res) return;
          setLiveSkills(res.skills);
          setSkillsSource(res.source);
        })
        .catch((err) => console.error("suggestSkills failed", err));
    })().catch((err: unknown) => {
      if (cancelled) return;
      console.error("Failed to load pathway", err);
      const msg =
        err instanceof Error ? err.message : "Could not load your pathway.";
      setLoadError(msg);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate]);

  const { totalCount, doneCount } = useMemo(() => {
    let total = 0;
    let d = 0;
    for (const plan of plans) {
      for (const cat of TAB_META) {
        for (const title of plan[cat.key]) {
          total += 1;
          if (done.has(itemId(plan.gradeValue, cat.key, title))) d += 1;
        }
      }
    }
    return { totalCount: total, doneCount: d };
  }, [plans, done]);

  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const toggleDone = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (user) saveCompletedItems(user.id, Array.from(next)).catch(() => {});
      return next;
    });
  };

  const addCustom = () => {
    const title = draftTitle.trim();
    if (!title || !user) return;
    const entry: CustomItem = {
      id: `custom:${Date.now()}`,
      title,
      addedAt: Date.now(),
    };
    const next = [entry, ...custom];
    setCustom(next);
    saveCustomItems(user.id, next).catch(() => {});
    setDraftTitle("");
    setAddOpen(false);
  };

  const removeCustom = (id: string) => {
    if (!user) return;
    const next = custom.filter((c) => c.id !== id);
    setCustom(next);
    saveCustomItems(user.id, next).catch(() => {});
  };

  if (authLoading || loading) {
    return (
      <YStack
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        style={{ background: "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)" }}
      >
        <Text fontSize={14} color="#6b7280">
          Loading your pathway…
        </Text>
      </YStack>
    );
  }

  if (loadError) {
    return (
      <YStack
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        gap={12}
        paddingHorizontal={24}
        style={{ background: "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)" }}
      >
        <Text fontSize={16} fontWeight="600" color="#b91c1c">
          We couldn't load your pathway.
        </Text>
        <Text fontSize={13} color="#6b7280" textAlign="center" maxWidth={420}>
          {loadError}
        </Text>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            height: 38,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(to right, #2563eb, #9333ea)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </YStack>
    );
  }

  return (
    <YStack
      minHeight="100vh"
      paddingVertical={32}
      paddingHorizontal={16}
      style={{
        background:
          "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
      }}
    >
      <YStack width="100%" maxWidth={960} marginHorizontal="auto" gap={20}>
        <YStack gap={6}>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} fontWeight="600" color="#2563eb">
              {track === "General" ? "Personalized" : track} track
            </Text>
            {source === "fallback" && (
              <Text fontSize={11} color="#9ca3af">
                · offline template
              </Text>
            )}
          </XStack>
          <Text fontSize={28} fontWeight="700" color="#111827">
            Your pathway to {profession}
          </Text>
          <Text fontSize={14} color="#6b7280">
            {doneCount} of {totalCount} recommendations complete · {progressPct}%
          </Text>
        </YStack>

        <YStack
          height={10}
          borderRadius={9999}
          backgroundColor="#e5e7eb"
          overflow="hidden"
        >
          <YStack
            width={`${progressPct}%`}
            height="100%"
            style={{
              background: "linear-gradient(to right, #2563eb, #9333ea)",
              transition: "width 300ms ease",
            }}
          />
        </YStack>

        <TrackerCard
          open={addOpen}
          onToggle={() => setAddOpen((o) => !o)}
          draft={draftTitle}
          setDraft={setDraftTitle}
          onAdd={addCustom}
          items={custom}
          onRemove={removeCustom}
        />

        {liveSkills.length > 0 && (
          <LiveSkillsCard
            profession={profession}
            skills={liveSkills}
            source={skillsSource}
          />
        )}

        <YStack gap={20}>
          {plans.map((plan, index) => (
            <GradeCard
              key={plan.gradeValue}
              index={index + 1}
              plan={plan}
              done={done}
              onToggle={toggleDone}
            />
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
}

function TrackerCard({
  open,
  onToggle,
  draft,
  setDraft,
  onAdd,
  items,
  onRemove,
}: {
  open: boolean;
  onToggle: () => void;
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
  items: CustomItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <YStack
      borderWidth={1}
      borderColor="#dbeafe"
      borderRadius={12}
      backgroundColor="rgba(239, 246, 255, 0.6)"
      padding={16}
      gap={items.length > 0 || open ? 12 : 0}
    >
      <XStack alignItems="center" justifyContent="space-between" gap={12}>
        <XStack alignItems="center" gap={10}>
          <Plus size={20} color="#2563eb" />
          <Text fontSize={16} fontWeight="600" color="#111827">
            Track What You've Already Done
          </Text>
        </XStack>
        <YStack
          onPress={onToggle}
          paddingHorizontal={14}
          paddingVertical={8}
          borderRadius={8}
          borderWidth={1}
          borderColor="#d1d5db"
          backgroundColor="white"
          hoverStyle={{ backgroundColor: "#f9fafb" }}
          cursor="pointer"
        >
          <Text fontSize={13} fontWeight="600" color="#111827">
            {open ? "Cancel" : "Add Item"}
          </Text>
        </YStack>
      </XStack>

      {open && (
        <XStack gap={8} flexWrap="wrap">
          <input
            type="text"
            value={draft}
            placeholder="e.g. Completed intro Python course"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
            autoFocus
            style={{
              flex: 1,
              minWidth: 200,
              height: 40,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              outline: "none",
              backgroundColor: "white",
              color: "#111827",
            }}
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!draft.trim()}
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: draft.trim()
                ? "linear-gradient(to right, #2563eb, #9333ea)"
                : "#93c5fd",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: draft.trim() ? "pointer" : "not-allowed",
            }}
          >
            Add
          </button>
        </XStack>
      )}

      {items.length > 0 && (
        <YStack gap={6}>
          {items.map((item) => (
            <XStack
              key={item.id}
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal={12}
              paddingVertical={10}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e7eb"
            >
              <XStack alignItems="center" gap={10} flex={1}>
                <YStack
                  width={20}
                  height={20}
                  borderRadius={9999}
                  backgroundColor="#16a34a"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Check size={14} color="white" />
                </YStack>
                <Text fontSize={14} color="#111827">
                  {item.title}
                </Text>
              </XStack>
              <YStack
                onPress={() => onRemove(item.id)}
                padding={6}
                borderRadius={6}
                hoverStyle={{ backgroundColor: "#fee2e2" }}
                cursor="pointer"
                aria-label="Remove"
              >
                <Trash2 size={16} color="#dc2626" />
              </YStack>
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

function GradeCard({
  index,
  plan,
  done,
  onToggle,
}: {
  index: number;
  plan: GradePlan;
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [active, setActive] = useState<PathwayCategory>("courses");

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      overflow="hidden"
      style={{ boxShadow: "0 4px 12px -4px rgba(0,0,0,0.08)" }}
    >
      <XStack
        alignItems="center"
        gap={12}
        paddingHorizontal={20}
        paddingVertical={16}
        backgroundColor="#f9fafb"
        borderBottomWidth={1}
        borderBottomColor="#f3f4f6"
      >
        <YStack
          width={32}
          height={32}
          borderRadius={9999}
          backgroundColor="#2563eb"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={14} fontWeight="700" color="white">
            {index}
          </Text>
        </YStack>
        <Text fontSize={18} fontWeight="600" color="#111827">
          {plan.label}
        </Text>
      </XStack>

      <YStack padding={16} gap={16}>
        <XStack
          backgroundColor="#f3f4f6"
          borderRadius={9999}
          padding={4}
          gap={4}
          alignSelf="stretch"
        >
          {TAB_META.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <YStack
                key={key}
                flex={1}
                onPress={() => setActive(key)}
                paddingVertical={8}
                paddingHorizontal={8}
                borderRadius={9999}
                backgroundColor={isActive ? "white" : "transparent"}
                hoverStyle={
                  isActive ? undefined : { backgroundColor: "#e5e7eb" }
                }
                cursor="pointer"
                alignItems="center"
                style={
                  isActive
                    ? { boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
                    : undefined
                }
              >
                <XStack alignItems="center" gap={6}>
                  <Icon size={14} color={isActive ? "#111827" : "#6b7280"} />
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={isActive ? "#111827" : "#6b7280"}
                  >
                    {label}
                  </Text>
                </XStack>
              </YStack>
            );
          })}
        </XStack>

        <YStack gap={10}>
          <Text fontSize={11} fontWeight="700" color="#6b7280" letterSpacing={1}>
            {TAB_META.find((t) => t.key === active)?.recommendedLabel}
          </Text>
          <YStack gap={8}>
            {plan[active].map((title) => {
              const id = itemId(plan.gradeValue, active, title);
              const checked = done.has(id);
              return (
                <XStack
                  key={id}
                  onPress={() => onToggle(id)}
                  alignItems="center"
                  gap={12}
                  paddingHorizontal={14}
                  paddingVertical={12}
                  borderRadius={8}
                  backgroundColor={checked ? "#ecfdf5" : "#eff6ff"}
                  hoverStyle={{
                    backgroundColor: checked ? "#d1fae5" : "#dbeafe",
                  }}
                  cursor="pointer"
                >
                  <Checkbox checked={checked} />
                  <Text
                    fontSize={14}
                    color="#111827"
                    flex={1}
                    style={{
                      textDecoration: checked ? "line-through" : "none",
                      opacity: checked ? 0.7 : 1,
                    }}
                  >
                    {title}
                  </Text>
                </XStack>
              );
            })}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}

function LiveSkillsCard({
  profession,
  skills,
  source,
}: {
  profession: string;
  skills: SuggestedSkill[];
  source: "onet" | "cache" | "onet_unconfigured" | "no_match" | null;
}) {
  return (
    <YStack
      borderWidth={1}
      borderColor="#e9d5ff"
      borderRadius={12}
      backgroundColor="rgba(250, 245, 255, 0.6)"
      padding={16}
      gap={12}
    >
      <XStack alignItems="center" justifyContent="space-between" gap={8}>
        <XStack alignItems="center" gap={10}>
          <Sparkles size={20} color="#9333ea" />
          <Text fontSize={16} fontWeight="600" color="#111827">
            In-demand skills for {profession}
          </Text>
        </XStack>
        <Text fontSize={11} color="#9ca3af">
          {source === "cache" ? "cached" : "live"} · O*NET
        </Text>
      </XStack>
      <YStack gap={8}>
        {skills.map((s) => {
          const pct = Math.max(0, Math.min(100, s.importance ?? 0));
          return (
            <YStack
              key={s.name}
              gap={6}
              paddingHorizontal={12}
              paddingVertical={10}
              borderRadius={8}
              backgroundColor="white"
              borderWidth={1}
              borderColor="#f3e8ff"
            >
              <XStack alignItems="center" justifyContent="space-between" gap={8}>
                <Text fontSize={14} fontWeight="600" color="#111827">
                  {s.name}
                </Text>
                {s.importance !== null && (
                  <Text fontSize={11} color="#6b7280">
                    importance {pct}
                  </Text>
                )}
              </XStack>
              {s.description && (
                <Text fontSize={12} color="#6b7280">
                  {s.description}
                </Text>
              )}
              <YStack
                height={6}
                borderRadius={9999}
                backgroundColor="#f3e8ff"
                overflow="hidden"
              >
                <YStack
                  width={`${pct}%`}
                  height="100%"
                  style={{
                    background:
                      "linear-gradient(to right, #a855f7, #9333ea)",
                  }}
                />
              </YStack>
            </YStack>
          );
        })}
      </YStack>
    </YStack>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <YStack
      width={20}
      height={20}
      borderRadius={6}
      borderWidth={checked ? 0 : 1}
      borderColor="#d1d5db"
      backgroundColor={checked ? "#16a34a" : "white"}
      alignItems="center"
      justifyContent="center"
    >
      {checked && <Check size={14} color="white" />}
    </YStack>
  );
}
