import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { Text, XStack, YStack } from "tamagui";

const features = [
  {
    Icon: BookOpen,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    title: "Course Recommendations",
    description:
      "Get year-by-year guidance on which courses to take to prepare for your dream career.",
  },
  {
    Icon: Users,
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
    title: "Activity Planning",
    description:
      "Discover extra-curricular activities and volunteer opportunities that align with your goals.",
  },
  {
    Icon: TrendingUp,
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    title: "Skills Development",
    description:
      "Learn which skills to develop each year to stay competitive in your chosen field.",
  },
];

const benefits = [
  {
    title: "Personalized Roadmaps",
    description:
      "Tailored guidance based on your current grade and career goals",
  },
  {
    title: "Expert Recommendations",
    description:
      "Courses, activities, and volunteer work curated by career experts",
  },
  {
    title: "Year-by-Year Planning",
    description: "Clear milestones and goals for each grade level",
  },
  {
    title: "Multiple Career Paths",
    description: "Explore diverse careers from tech to healthcare to education",
  },
];

export default function Home() {
  return (
    <YStack
      minHeight="100vh"
      position="relative"
      style={{
        background:
          "linear-gradient(to bottom right, #eff6ff, #faf5ff, #fdf2f8)",
      }}
    >
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1659356874140-166861df06da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNhcmVlciUyMHBsYW5uaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc3NTMzMjQyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <YStack position="relative" zIndex={10}>
        {/* Hero Section */}
        <YStack
          width="100%"
          maxWidth={1280}
          marginHorizontal="auto"
          paddingHorizontal={16}
          paddingTop={80}
          paddingBottom={64}
          alignItems="center"
        >
          <YStack padding={16} borderRadius={9999} marginBottom={10}>
            <GraduationCap size={80} color="#2563eb" />
          </YStack>

          <Text
            fontSize={48}
            $gtSm={{ fontSize: 60 }}
            marginBottom={24}
            padding={15}
            textAlign="center"
            style={{
              background: "linear-gradient(to right, #2563eb, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Your Future Starts Here
          </Text>

          <Text
            fontSize={20}
            color="#4b5563"
            marginBottom={32}
            maxWidth={640}
            textAlign="center"
            lineHeight={30}
          >
            Discover your personalized career pathway with tailored
            recommendations for courses, activities, and volunteer opportunities
            from 9th grade to graduation.
          </Text>

          <XStack gap={16} flexWrap="wrap" justifyContent="center">
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <YStack
                backgroundColor="#2563eb"
                hoverStyle={{ backgroundColor: "#1d4ed8" }}
                pressStyle={{ backgroundColor: "#1e40af" }}
                borderRadius={8}
                paddingHorizontal={32}
                paddingVertical={20}
                cursor="pointer"
              >
                <Text fontSize={18} fontWeight="600" color="white">
                  Start Your Journey
                </Text>
              </YStack>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <YStack
                backgroundColor="white"
                borderWidth={1}
                borderColor="#d1d5db"
                hoverStyle={{ backgroundColor: "#f9fafb" }}
                borderRadius={8}
                paddingHorizontal={32}
                paddingVertical={20}
                cursor="pointer"
              >
                <Text fontSize={18} fontWeight="600" color="#111827">
                  I Have an Account
                </Text>
              </YStack>
            </Link>
          </XStack>
        </YStack>

        {/* Features Section */}
        <YStack
          width="100%"
          maxWidth={1280}
          marginHorizontal="auto"
          paddingHorizontal={16}
          paddingVertical={64}
        >
          <Text fontSize={30} textAlign="center" marginBottom={48}>
            How CareerPath Helps You Succeed
          </Text>

          <XStack gap={32} flexWrap="wrap">
            {features.map(({ Icon, iconBg, iconColor, title, description }) => (
              <YStack
                key={title}
                flex={1}
                minWidth={260}
                backgroundColor="white"
                borderRadius={8}
                padding={32}
                style={{ boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
              >
                <YStack
                  width={48}
                  height={48}
                  backgroundColor={iconBg}
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="center"
                  marginBottom={16}
                >
                  <Icon size={24} color={iconColor} />
                </YStack>
                <Text fontSize={20} marginBottom={12}>
                  {title}
                </Text>
                <Text fontSize={14} color="#4b5563" lineHeight={22}>
                  {description}
                </Text>
              </YStack>
            ))}
          </XStack>
        </YStack>

        {/* Benefits Section */}
        <YStack
          backgroundColor="rgba(255,255,255,0.5)"
          paddingVertical={64}
          marginTop={32}
          style={{ backdropFilter: "blur(12px)" }}
        >
          <YStack
            width="100%"
            maxWidth={1280}
            marginHorizontal="auto"
            paddingHorizontal={16}
          >
            <XStack gap={48} flexWrap="wrap" alignItems="center">
              <YStack flex={1} minWidth={320}>
                <Text fontSize={30} marginBottom={24}>
                  Plan Your Perfect Path
                </Text>
                <YStack gap={16}>
                  {benefits.map(({ title, description }) => (
                    <XStack key={title} gap={12} alignItems="flex-start">
                      <YStack marginTop={4}>
                        <CheckCircle size={24} color="#16a34a" />
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={16} fontWeight="600" marginBottom={4}>
                          {title}
                        </Text>
                        <Text fontSize={14} color="#4b5563">
                          {description}
                        </Text>
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              </YStack>

              <YStack
                flex={1}
                minWidth={320}
                borderRadius={8}
                padding={32}
                style={{
                  background:
                    "linear-gradient(to bottom right, #2563eb, #9333ea)",
                }}
              >
                <Text fontSize={24} marginBottom={16} color="white">
                  Ready to Get Started?
                </Text>
                <Text
                  fontSize={14}
                  marginBottom={24}
                  color="#dbeafe"
                  lineHeight={22}
                >
                  Join thousands of students who are already planning their
                  future with CareerPath.
                </Text>
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <YStack
                    backgroundColor="white"
                    hoverStyle={{ backgroundColor: "#f3f4f6" }}
                    borderRadius={8}
                    paddingVertical={12}
                    alignItems="center"
                    cursor="pointer"
                  >
                    <Text fontSize={16} fontWeight="600" color="#2563eb">
                      Create Free Account
                    </Text>
                  </YStack>
                </Link>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
