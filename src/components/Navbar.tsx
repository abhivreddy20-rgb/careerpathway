import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, LogOut } from "lucide-react";
import { Text, XStack, YStack } from "tamagui";
import { useAuth } from "../lib/authContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/careers", label: "Explore Careers" },
  { to: "/quiz", label: "Career Quiz" },
  { to: "/pathways", label: "Pathways" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <YStack
      position="sticky"
      top={0}
      zIndex={50}
      backgroundColor="rgba(255,255,255,0.8)"
      borderBottomWidth={1}
      borderBottomColor="#f3f4f6"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <XStack
        width="100%"
        maxWidth={1280}
        marginHorizontal="auto"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <XStack alignItems="center" gap={8}>
            <GraduationCap size={28} color="#1d4ed8" />
            <Text fontSize={20} fontWeight="700" color="#1d4ed8">
              CareerPathway
            </Text>
          </XStack>
        </Link>

        <XStack
          display="none"
          $gtSm={{ display: "flex" }}
          alignItems="center"
          gap={4}
        >
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <YStack
                  paddingHorizontal={16}
                  paddingVertical={8}
                  borderRadius={8}
                  backgroundColor={active ? "#eff6ff" : "transparent"}
                  hoverStyle={{
                    backgroundColor: active ? "#eff6ff" : "#f9fafb",
                  }}
                  cursor="pointer"
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={active ? "#1d4ed8" : "#4b5563"}
                  >
                    {label}
                  </Text>
                </YStack>
              </Link>
            );
          })}
        </XStack>

        <XStack
          display="none"
          $gtSm={{ display: "flex" }}
          alignItems="center"
          gap={8}
        >
          {user ? (
            <>
              <Link to="/pathway" style={{ textDecoration: "none" }}>
                <YStack
                  borderRadius={8}
                  paddingHorizontal={16}
                  paddingVertical={10}
                  hoverStyle={{ backgroundColor: "#f3f4f6" }}
                  cursor="pointer"
                >
                  <Text fontSize={14} fontWeight="600" color="#1d4ed8">
                    My pathway
                  </Text>
                </YStack>
              </Link>
              <YStack
                onPress={handleSignOut}
                borderRadius={8}
                paddingHorizontal={16}
                paddingVertical={10}
                borderWidth={1}
                borderColor="#d1d5db"
                hoverStyle={{ backgroundColor: "#f9fafb" }}
                cursor="pointer"
              >
                <XStack alignItems="center" gap={6}>
                  <LogOut size={14} color="#4b5563" />
                  <Text fontSize={14} fontWeight="600" color="#4b5563">
                    Log out
                  </Text>
                </XStack>
              </YStack>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <YStack
                  borderRadius={8}
                  paddingHorizontal={16}
                  paddingVertical={10}
                  hoverStyle={{ backgroundColor: "#f3f4f6" }}
                  cursor="pointer"
                >
                  <Text fontSize={14} fontWeight="600" color="#1d4ed8">
                    Login
                  </Text>
                </YStack>
              </Link>
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <YStack
                  backgroundColor="#2563eb"
                  hoverStyle={{ backgroundColor: "#1d4ed8" }}
                  pressStyle={{ backgroundColor: "#1e40af" }}
                  borderRadius={8}
                  paddingHorizontal={20}
                  paddingVertical={10}
                  cursor="pointer"
                >
                  <Text fontSize={14} fontWeight="600" color="white">
                    Sign up
                  </Text>
                </YStack>
              </Link>
            </>
          )}
        </XStack>

        <YStack $gtSm={{ display: "none" }}>
          <YStack
            onPress={() => setOpen(!open)}
            padding={8}
            borderRadius={8}
            hoverStyle={{ backgroundColor: "#f3f4f6" }}
            cursor="pointer"
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={24} color="#4b5563" />
            ) : (
              <Menu size={24} color="#4b5563" />
            )}
          </YStack>
        </YStack>
      </XStack>

      {open && (
        <YStack
          $gtSm={{ display: "none" }}
          borderTopWidth={1}
          borderTopColor="#f3f4f6"
          backgroundColor="white"
          paddingHorizontal={16}
          paddingBottom={16}
        >
          <YStack paddingTop={8} gap={4}>
            {navLinks.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <YStack
                    paddingHorizontal={16}
                    paddingVertical={10}
                    borderRadius={8}
                    backgroundColor={active ? "#eff6ff" : "transparent"}
                    hoverStyle={{
                      backgroundColor: active ? "#eff6ff" : "#f9fafb",
                    }}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="500"
                      color={active ? "#1d4ed8" : "#4b5563"}
                    >
                      {label}
                    </Text>
                  </YStack>
                </Link>
              );
            })}
          </YStack>
          <YStack gap={8} marginTop={12}>
            {user ? (
              <YStack
                onPress={handleSignOut}
                width="100%"
                borderWidth={1}
                borderColor="#d1d5db"
                hoverStyle={{ backgroundColor: "#f9fafb" }}
                borderRadius={8}
                paddingVertical={10}
                alignItems="center"
                cursor="pointer"
              >
                <Text fontSize={14} fontWeight="600" color="#4b5563">
                  Log out
                </Text>
              </YStack>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <YStack
                    width="100%"
                    borderWidth={1}
                    borderColor="#d1d5db"
                    hoverStyle={{ backgroundColor: "#f9fafb" }}
                    borderRadius={8}
                    paddingVertical={10}
                    alignItems="center"
                    cursor="pointer"
                  >
                    <Text fontSize={14} fontWeight="600" color="#1d4ed8">
                      Login
                    </Text>
                  </YStack>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <YStack
                    width="100%"
                    backgroundColor="#2563eb"
                    hoverStyle={{ backgroundColor: "#1d4ed8" }}
                    borderRadius={8}
                    paddingVertical={10}
                    alignItems="center"
                    cursor="pointer"
                  >
                    <Text fontSize={14} fontWeight="600" color="white">
                      Sign up
                    </Text>
                  </YStack>
                </Link>
              </>
            )}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
