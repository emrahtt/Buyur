import {
  Building2,
  Droplets,
  Hammer,
  HardHat,
  Home,
  type LucideProps,
  Package,
  PaintRoller,
  Scissors,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'
import type { IconName } from '@/lib/modules'

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  sparkles: Sparkles,
  home: Home,
  building: Building2,
  truck: Truck,
  'hard-hat': HardHat,
  sofa: Sofa,
  scissors: Scissors,
  hammer: Hammer,
  wrench: Wrench,
  paint: PaintRoller,
  package: Package,
  zap: Zap,
  droplets: Droplets,
}

export function ModuleIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICONS[name]
  return <Icon aria-hidden="true" {...props} />
}
