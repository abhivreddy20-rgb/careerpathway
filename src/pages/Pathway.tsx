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
  ArrowLeft,
  GraduationCap,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Text, XStack, YStack } from "tamagui";
import {
  itemId,
  type GradePlan,
  type PathwayCategory,
  type PathwayTrack,
} from "../data/pathway";
import { useAuth } from "../lib/authContext";
import { PROFESSION_SUGGESTIONS } from "../data/professions";
import { trackToCipCodes } from "../data/cipCodes";
import {
  fetchProfile,
  loadPathway,
  saveCompletedItems,
  saveCustomItems,
  searchColleges,
  setActiveProfession,
  setSecondaryProfession,
  suggestSkills,
  type College,
  type CompletedMap,
  type CustomItem,
  type CustomMap,
  type SuggestedSkill,
} from "../lib/api";

// Pulls a useful message out of anything that gets thrown — Error instances,
// Supabase PostgrestError shapes, plain strings, or random objects.
function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; error?: unknown; details?: unknown };
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.error === "string" && e.error) return e.error;
    if (typeof e.details === "string" && e.details) return e.details;
  }
  return "Could not load your pathway.";
}

const TAB_META: {
  key: PathwayCategory;
  label: string;
  Icon: typeof BookOpen;
  recommendedLabel: string;
}[] = [
  {
    key: "courses",
    label: "Courses",
    Icon: BookOpen,
    recommendedLabel: "RECOMMENDED COURSES",
  },
  {
    key: "activities",
    label: "Activities",
    Icon: Users,
    recommendedLabel: "RECOMMENDED ACTIVITIES",
  },
  {
    key: "volunteer",
    label: "Volunteer",
    Icon: Heart,
    recommendedLabel: "RECOMMENDED VOLUNTEER WORK",
  },
  {
    key: "skills",
    label: "Skills",
    Icon: Sparkles,
    recommendedLabel: "RECOMMENDED SKILLS",
  },
];

export default function Pathway() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Profile-level state that doesn't change when you flip between careers.
  const [currentGrade, setCurrentGrade] = useState<string>("");
  const [primaryProfession, setPrimaryProfession] = useState<string>("");
  const [secondaryProfession, setSecondaryProfessionState] = useState<
    string | null
  >(null);
  const [activeProfession, setActiveProfessionState] = useState<string>("");
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [customMap, setCustomMap] = useState<CustomMap>({});

  // Pathway state for the *currently active* career.
  const [track, setTrack] = useState<PathwayTrack>("General");
  const [plans, setPlans] = useState<GradePlan[]>([]);
  const [source, setSource] = useState<"openai" | "fallback">("fallback");

  const [addOpen, setAddOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [addCareerOpen, setAddCareerOpen] = useState(false);
  const [careerDraft, setCareerDraft] = useState("");
  const [liveSkills, setLiveSkills] = useState<SuggestedSkill[]>([]);
  const [skillsSource, setSkillsSource] = useState<
    "onet" | "cache" | "onet_unconfigured" | "no_match" | null
  >(null);

  // Tabs and colleges-tab state.
  const [activeTab, setActiveTab] = useState<"roadmap" | "colleges">("roadmap");
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError, setCollegesError] = useState<string | null>(null);
  const [collegeState, setCollegeState] = useState<string>("");
  const [collegeQuery, setCollegeQuery] = useState<string>("");
  const [collegesLoadedFor, setCollegesLoadedFor] = useState<string | null>(
    null,
  );

  // Per-active-career derived state.
  const done = useMemo<Set<string>>(
    () => new Set(completedMap[activeProfession] ?? []),
    [completedMap, activeProfession],
  );
  const custom = useMemo<CustomItem[]>(
    () => customMap[activeProfession] ?? [],
    [customMap, activeProfession],
  );

  // Initial load: fetch profile, then load the pathway for whichever career
  // is marked active (defaulting to the primary).
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
      const active = profile.active_profession ?? profile.desired_profession;
      const bundle = await loadPathway(profile.current_grade, active);
      if (cancelled) return;
      setCurrentGrade(profile.current_grade);
      setPrimaryProfession(profile.desired_profession);
      setSecondaryProfessionState(profile.secondary_profession);
      setActiveProfessionState(active);
      setCompletedMap(profile.completed_items);
      setCustomMap(profile.custom_items);
      setTrack(bundle.track);
      setPlans(bundle.plans);
      setSource(bundle.source);
      setLoading(false);

      // Fire-and-forget: enrich the page with live O*NET skills.
      suggestSkills({ profession: active })
        .then((res) => {
          if (cancelled || !res) return;
          setLiveSkills(res.skills);
          setSkillsSource(res.source);
        })
        .catch((err) => console.error("suggestSkills failed", err));
    })().catch((err: unknown) => {
      if (cancelled) return;
      console.error("Failed to load pathway", err);
      setLoadError(formatError(err));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate]);

  const switchCareer = async (target: string) => {
    if (!user || !currentGrade || target === activeProfession) return;
    setSwitching(true);
    setLoadError(null);
    setLiveSkills([]);
    setSkillsSource(null);
    try {
      const bundle = await loadPathway(currentGrade, target);
      setActiveProfessionState(target);
      setTrack(bundle.track);
      setPlans(bundle.plans);
      setSource(bundle.source);
      setActiveProfession(user.id, target).catch(() => {});
      suggestSkills({ profession: target })
        .then((res) => {
          if (!res) return;
          setLiveSkills(res.skills);
          setSkillsSource(res.source);
        })
        .catch((err) => console.error("suggestSkills failed", err));
    } catch (err) {
      console.error("Failed to switch career", err);
      setLoadError(formatError(err));
    } finally {
      setSwitching(false);
    }
  };

  const loadColleges = async (
    profession: string,
    activeTrack: PathwayTrack,
    state: string,
    query: string,
  ) => {
    const cipCodes = trackToCipCodes(activeTrack);
    setCollegesLoading(true);
    setCollegesError(null);
    try {
      const result = await searchColleges({
        state: state || undefined,
        query: query.trim() || undefined,
        cipCodes: cipCodes.length > 0 ? cipCodes : undefined,
        limit: 12,
      });
      setColleges(result?.colleges ?? []);
      setCollegesLoadedFor(
        `${profession}|${activeTrack}|${state}|${query.trim()}`,
      );
    } catch (err) {
      console.error("Failed to load colleges", err);
      setCollegesError(formatError(err));
    } finally {
      setCollegesLoading(false);
    }
  };

  // Lazy-load colleges the first time the tab is opened (per career+track).
  useEffect(() => {
    if (activeTab !== "colleges") return;
    if (!activeProfession) return;
    const key = `${activeProfession}|${track}|${collegeState}|${collegeQuery.trim()}`;
    if (collegesLoadedFor === key) return;
    loadColleges(activeProfession, track, collegeState, collegeQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeProfession, track]);

  const addSecondaryCareer = async () => {
    const title = careerDraft.trim();
    if (!title || !user) return;
    if (title.toLowerCase() === primaryProfession.toLowerCase()) {
      setCareerDraft("");
      return;
    }
    setSecondaryProfessionState(title);
    setAddCareerOpen(false);
    setCareerDraft("");
    setSecondaryProfession(user.id, title).catch(() => {});
    await switchCareer(title);
  };

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

  const progressPct =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const toggleDone = (id: string) => {
    if (!user || !activeProfession) return;
    const current = completedMap[activeProfession] ?? [];
    const has = current.includes(id);
    const nextItems = has ? current.filter((x) => x !== id) : [...current, id];
    const nextMap = { ...completedMap, [activeProfession]: nextItems };
    setCompletedMap(nextMap);
    saveCompletedItems(
      user.id,
      activeProfession,
      nextItems,
      completedMap,
    ).catch(() => {});
  };

  const addCustom = () => {
    const title = draftTitle.trim();
    if (!title || !user || !activeProfession) return;
    const entry: CustomItem = {
      id: `custom:${Date.now()}`,
      title,
      addedAt: Date.now(),
    };
    const current = customMap[activeProfession] ?? [];
    const nextItems = [entry, ...current];
    const nextMap = { ...customMap, [activeProfession]: nextItems };
    setCustomMap(nextMap);
    saveCustomItems(user.id, activeProfession, nextItems, customMap).catch(
      () => {},
    );
    setDraftTitle("");
    setAddOpen(false);
  };

  const removeCustom = (id: string) => {
    if (!user || !activeProfession) return;
    const current = customMap[activeProfession] ?? [];
    const nextItems = current.filter((c) => c.id !== id);
    const nextMap = { ...customMap, [activeProfession]: nextItems };
    setCustomMap(nextMap);
    saveCustomItems(user.id, activeProfession, nextItems, customMap).catch(
      () => {},
    );
  };

  if (authLoading || loading) {
    return (
      <YStack
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        style={{
          background:
            "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
        }}
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
        style={{
          background:
            "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
        }}
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
        <XStack
          onPress={() => navigate("/onboarding")}
          alignItems="center"
          gap={6}
          alignSelf="flex-start"
          paddingHorizontal={10}
          paddingVertical={6}
          borderRadius={8}
          hoverStyle={{ backgroundColor: "rgba(37, 99, 235, 0.08)" }}
          cursor="pointer"
        >
          <ArrowLeft size={16} color="#2563eb" />
          <Text fontSize={13} fontWeight="600" color="#2563eb">
            Change career
          </Text>
        </XStack>

        <CareerSwitcher
          primary={primaryProfession}
          secondary={secondaryProfession}
          active={activeProfession}
          switching={switching}
          onSwitch={switchCareer}
          addOpen={addCareerOpen}
          setAddOpen={setAddCareerOpen}
          draft={careerDraft}
          setDraft={setCareerDraft}
          onAdd={addSecondaryCareer}
        />

        <XStack
          backgroundColor="#f3f4f6"
          borderRadius={9999}
          padding={4}
          gap={4}
          alignSelf="stretch"
        >
          {(
            [
              { key: "roadmap", label: "Roadmap", Icon: BookOpen },
              { key: "colleges", label: "Colleges", Icon: GraduationCap },
            ] as const
          ).map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <YStack
                key={key}
                flex={1}
                onPress={() => setActiveTab(key)}
                paddingVertical={10}
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
                  <Icon size={15} color={isActive ? "#111827" : "#6b7280"} />
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

        {activeTab === "roadmap" && (
          <>
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
                Your pathway to {activeProfession}
              </Text>
              <Text fontSize={14} color="#6b7280">
                {doneCount} of {totalCount} recommendations complete ·{" "}
                {progressPct}%
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
                profession={activeProfession}
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
          </>
        )}

        {activeTab === "colleges" && (
          <CollegesView
            profession={activeProfession}
            colleges={colleges}
            loading={collegesLoading}
            error={collegesError}
            stateFilter={collegeState}
            setStateFilter={setCollegeState}
            query={collegeQuery}
            setQuery={setCollegeQuery}
            onSearch={() =>
              loadColleges(activeProfession, track, collegeState, collegeQuery)
            }
          />
        )}
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
          <Text
            fontSize={11}
            fontWeight="700"
            color="#6b7280"
            letterSpacing={1}
          >
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

function CareerSwitcher({
  primary,
  secondary,
  active,
  switching,
  onSwitch,
  addOpen,
  setAddOpen,
  draft,
  setDraft,
  onAdd,
}: {
  primary: string;
  secondary: string | null;
  active: string;
  switching: boolean;
  onSwitch: (target: string) => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
}) {
  const careers = secondary ? [primary, secondary] : [primary];
  return (
    <YStack gap={8}>
      <XStack
        backgroundColor="white"
        borderRadius={9999}
        padding={4}
        gap={4}
        alignSelf="flex-start"
        borderWidth={1}
        borderColor="#e5e7eb"
        flexWrap="wrap"
      >
        {careers.map((c) => {
          const isActive = c === active;
          return (
            <YStack
              key={c}
              onPress={() => !switching && onSwitch(c)}
              paddingHorizontal={14}
              paddingVertical={8}
              borderRadius={9999}
              backgroundColor={isActive ? "#2563eb" : "transparent"}
              hoverStyle={isActive ? undefined : { backgroundColor: "#f3f4f6" }}
              cursor={switching ? "not-allowed" : "pointer"}
              opacity={switching && !isActive ? 0.6 : 1}
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={isActive ? "white" : "#374151"}
              >
                {c}
              </Text>
            </YStack>
          );
        })}
        {!secondary && (
          <YStack
            onPress={() => setAddOpen(!addOpen)}
            paddingHorizontal={12}
            paddingVertical={8}
            borderRadius={9999}
            hoverStyle={{ backgroundColor: "#f3f4f6" }}
            cursor="pointer"
          >
            <XStack alignItems="center" gap={4}>
              <Plus size={14} color="#2563eb" />
              <Text fontSize={13} fontWeight="600" color="#2563eb">
                Add second career
              </Text>
            </XStack>
          </YStack>
        )}
      </XStack>

      {addOpen && !secondary && (
        <YStack
          gap={10}
          padding={12}
          borderRadius={10}
          borderWidth={1}
          borderColor="#e5e7eb"
          backgroundColor="white"
        >
          <Text fontSize={13} fontWeight="600" color="#374151">
            Pick your second career
          </Text>
          <XStack gap={8} flexWrap="wrap" alignItems="center">
            <input
              type="text"
              list="career-switcher-suggestions"
              value={draft}
              placeholder="e.g. Doctor"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
              autoFocus
              style={{
                flex: 1,
                minWidth: 200,
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                outline: "none",
                backgroundColor: "white",
                color: "#111827",
              }}
            />
            <datalist id="career-switcher-suggestions">
              {PROFESSION_SUGGESTIONS.filter(
                (p) => p.toLowerCase() !== primary.toLowerCase(),
              ).map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={onAdd}
              disabled={!draft.trim()}
              style={{
                height: 38,
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
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setAddOpen(false);
              }}
              style={{
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "white",
                color: "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </XStack>
          <XStack gap={8} flexWrap="wrap">
            {PROFESSION_SUGGESTIONS.filter(
              (p) => p.toLowerCase() !== primary.toLowerCase(),
            ).map((p) => {
              const isActive = draft === p;
              return (
                <YStack
                  key={p}
                  onPress={() => setDraft(p)}
                  paddingHorizontal={12}
                  paddingVertical={6}
                  borderRadius={9999}
                  borderWidth={1}
                  borderColor={isActive ? "#2563eb" : "#e5e7eb"}
                  backgroundColor={isActive ? "#eff6ff" : "white"}
                  hoverStyle={{
                    backgroundColor: isActive ? "#eff6ff" : "#f9fafb",
                  }}
                  cursor="pointer"
                >
                  <Text
                    fontSize={12}
                    fontWeight="500"
                    color={isActive ? "#1d4ed8" : "#4b5563"}
                  >
                    {p}
                  </Text>
                </YStack>
              );
            })}
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}

// Two-letter US state codes for the dropdown.
const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

function CollegesView({
  profession,
  colleges,
  loading,
  error,
  stateFilter,
  setStateFilter,
  query,
  setQuery,
  onSearch,
}: {
  profession: string;
  colleges: College[];
  loading: boolean;
  error: string | null;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  query: string;
  setQuery: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <YStack gap={16}>
      <YStack gap={4}>
        <Text fontSize={20} fontWeight="700" color="#111827">
          Colleges to consider for {profession}
        </Text>
        <Text fontSize={13} color="#6b7280">
          Live data from the U.S. Department of Education's College Scorecard.
        </Text>
      </YStack>

      <XStack
        gap={8}
        flexWrap="wrap"
        alignItems="center"
        backgroundColor="white"
        padding={12}
        borderRadius={10}
        borderWidth={1}
        borderColor="#e5e7eb"
      >
        <YStack flex={1} minWidth={200}>
          <input
            type="text"
            value={query}
            placeholder="Search by school name (optional)"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            style={{
              width: "100%",
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              outline: "none",
              backgroundColor: "white",
              color: "#111827",
              boxSizing: "border-box",
            }}
          />
        </YStack>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
            outline: "none",
            backgroundColor: "white",
            color: "#111827",
          }}
        >
          <option value="">All states</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          style={{
            height: 38,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            background: loading
              ? "#93c5fd"
              : "linear-gradient(to right, #2563eb, #9333ea)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </XStack>

      {error && (
        <Text fontSize={13} color="#b91c1c">
          {error}
        </Text>
      )}

      {loading && colleges.length === 0 && (
        <Text fontSize={13} color="#6b7280">
          Loading colleges…
        </Text>
      )}

      {!loading && colleges.length === 0 && !error && (
        <Text fontSize={13} color="#6b7280">
          No colleges matched. Try clearing the filters or a different state.
        </Text>
      )}

      <YStack gap={12}>
        {colleges.map((c) => (
          <CollegeRow key={c.unitid} college={c} />
        ))}
      </YStack>
    </YStack>
  );
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Combine reading + math 25th/75th percentiles into a single SAT range when
// the school reports them. Falls back to the average if percentiles missing.
function formatSatRange(c: College): string | null {
  const r25 = num(c.sat_reading_25);
  const r75 = num(c.sat_reading_75);
  const m25 = num(c.sat_math_25);
  const m75 = num(c.sat_math_75);
  if (r25 !== null && r75 !== null && m25 !== null && m75 !== null) {
    return `SAT ${r25 + m25}–${r75 + m75}`;
  }
  const avg = num(c.sat_avg);
  if (avg !== null) return `SAT ${avg} avg`;
  return null;
}

function formatActRange(c: College): string | null {
  const a25 = num(c.act_25);
  const a75 = num(c.act_75);
  if (a25 !== null && a75 !== null) return `ACT ${a25}–${a75}`;
  return null;
}

function CollegeRow({ college }: { college: College }) {
  const admission =
    college.admission_rate !== null
      ? `${Math.round(college.admission_rate * 100)}% acceptance`
      : null;
  const sat = formatSatRange(college);
  const act = formatActRange(college);
  const cost =
    college.cost_attendance !== null
      ? `$${Math.round(college.cost_attendance).toLocaleString()}/yr`
      : null;
  const size =
    college.size !== null ? `${college.size.toLocaleString()} students` : null;
  const location = [college.city, college.state].filter(Boolean).join(", ");
  const summary = [admission, cost, size].filter(Boolean) as string[];
  const admitProfile = [sat, act].filter(Boolean) as string[];

  const url =
    college.url &&
    (college.url.startsWith("http") ? college.url : `https://${college.url}`);

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding={16}
      gap={10}
      borderWidth={1}
      borderColor="#e5e7eb"
      style={{ boxShadow: "0 2px 6px -3px rgba(0,0,0,0.06)" }}
    >
      <XStack alignItems="flex-start" justifyContent="space-between" gap={12}>
        <YStack gap={4} flex={1}>
          <Text fontSize={16} fontWeight="700" color="#111827">
            {college.name}
          </Text>
          {location && (
            <XStack alignItems="center" gap={4}>
              <MapPin size={13} color="#6b7280" />
              <Text fontSize={12} color="#6b7280">
                {location}
              </Text>
            </XStack>
          )}
        </YStack>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            Visit <ExternalLink size={12} />
          </a>
        )}
      </XStack>
      {summary.length > 0 && (
        <XStack gap={8} flexWrap="wrap">
          {summary.map((s) => (
            <YStack
              key={s}
              paddingHorizontal={10}
              paddingVertical={4}
              borderRadius={9999}
              backgroundColor="#eff6ff"
            >
              <Text fontSize={11} fontWeight="600" color="#1d4ed8">
                {s}
              </Text>
            </YStack>
          ))}
        </XStack>
      )}
      {admitProfile.length > 0 && (
        <YStack
          gap={4}
          paddingTop={8}
          borderTopWidth={1}
          borderTopColor="#f3f4f6"
        >
          <Text
            fontSize={10}
            fontWeight="700"
            color="#6b7280"
            letterSpacing={1}
          >
            WHAT IT TAKES
          </Text>
          <XStack gap={8} flexWrap="wrap">
            {admitProfile.map((s) => (
              <YStack
                key={s}
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius={9999}
                backgroundColor="#f5f3ff"
              >
                <Text fontSize={11} fontWeight="600" color="#6d28d9">
                  {s}
                </Text>
              </YStack>
            ))}
          </XStack>
        </YStack>
      )}
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
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap={8}
              >
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
                    background: "linear-gradient(to right, #a855f7, #9333ea)",
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
