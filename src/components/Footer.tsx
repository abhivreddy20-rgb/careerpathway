import { Link } from 'react-router-dom'
import { Compass, Globe, MessageCircle, Users } from 'lucide-react'
import { Text, XStack, YStack } from 'tamagui'

const exploreLinks = [
  { to: '/careers', label: 'Career Explorer' },
  { to: '/quiz', label: 'Career Quiz' },
  { to: '/pathways', label: 'Learning Pathways' },
]

const companyLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/about', label: 'Contact' },
  { to: '/about', label: 'Privacy Policy' },
]

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <Text
        fontSize={14}
        color="#9ca3af"
        hoverStyle={{ color: 'white' }}
        cursor="pointer"
      >
        {label}
      </Text>
    </Link>
  )
}

export default function Footer() {
  return (
    <YStack backgroundColor="#111827">
      <YStack
        width="100%"
        maxWidth={1280}
        marginHorizontal="auto"
        paddingHorizontal={16}
        paddingVertical={48}
      >
        <XStack flexWrap="wrap" gap={32}>
          <YStack flex={1} minWidth={240} gap={12}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <XStack alignItems="center" gap={8}>
                <Compass size={24} color="white" />
                <Text fontSize={18} fontWeight="700" color="white">
                  CareerPathway
                </Text>
              </XStack>
            </Link>
            <Text fontSize={14} color="#9ca3af" lineHeight={22}>
              Helping students and professionals navigate their career journey with
              confidence through exploration, assessments, and guided pathways.
            </Text>
          </YStack>

          <YStack flex={1} minWidth={160} gap={12}>
            <Text fontSize={14} fontWeight="600" color="white">
              Explore
            </Text>
            <YStack gap={8}>
              {exploreLinks.map((l) => (
                <FooterLink key={l.label} to={l.to} label={l.label} />
              ))}
            </YStack>
          </YStack>

          <YStack flex={1} minWidth={160} gap={12}>
            <Text fontSize={14} fontWeight="600" color="white">
              Company
            </Text>
            <YStack gap={8}>
              {companyLinks.map((l) => (
                <FooterLink key={l.label} to={l.to} label={l.label} />
              ))}
            </YStack>
          </YStack>

          <YStack flex={1} minWidth={160} gap={12}>
            <Text fontSize={14} fontWeight="600" color="white">
              Connect
            </Text>
            <XStack gap={12}>
              <YStack
                backgroundColor="#1f2937"
                hoverStyle={{ backgroundColor: '#374151' }}
                borderRadius={8}
                padding={8}
                cursor="pointer"
                aria-label="Social"
              >
                <MessageCircle size={20} color="#9ca3af" />
              </YStack>
              <YStack
                backgroundColor="#1f2937"
                hoverStyle={{ backgroundColor: '#374151' }}
                borderRadius={8}
                padding={8}
                cursor="pointer"
                aria-label="Community"
              >
                <Users size={20} color="#9ca3af" />
              </YStack>
              <YStack
                backgroundColor="#1f2937"
                hoverStyle={{ backgroundColor: '#374151' }}
                borderRadius={8}
                padding={8}
                cursor="pointer"
                aria-label="Website"
              >
                <Globe size={20} color="#9ca3af" />
              </YStack>
            </XStack>
          </YStack>
        </XStack>

        <YStack
          marginTop={40}
          borderTopWidth={1}
          borderTopColor="#1f2937"
          paddingTop={24}
          alignItems="center"
        >
          <Text fontSize={12} color="#9ca3af">
            &copy; {new Date().getFullYear()} CareerPathway. All rights reserved.
          </Text>
        </YStack>
      </YStack>
    </YStack>
  )
}
