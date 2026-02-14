import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import React from 'react'

// Mock global @heroicons/react/24/outline - les icones SVG ne fonctionnent pas dans happy-dom
const creerIconeMock = (nom: string) => {
  const Composant = (props: Record<string, unknown>) =>
    React.createElement('span', { 'data-testid': `icon-${nom}`, ...props }, nom)
  Composant.displayName = nom
  return Composant
}

vi.mock('@heroicons/react/24/outline', () => ({
  ArrowDownTrayIcon: creerIconeMock('ArrowDownTrayIcon'),
  ArrowPathIcon: creerIconeMock('ArrowPathIcon'),
  ArrowTrendingUpIcon: creerIconeMock('ArrowTrendingUpIcon'),
  ArrowTrendingDownIcon: creerIconeMock('ArrowTrendingDownIcon'),
  BellIcon: creerIconeMock('BellIcon'),
  BellSlashIcon: creerIconeMock('BellSlashIcon'),
  CalendarDaysIcon: creerIconeMock('CalendarDaysIcon'),
  CheckCircleIcon: creerIconeMock('CheckCircleIcon'),
  CheckIcon: creerIconeMock('CheckIcon'),
  ChevronDownIcon: creerIconeMock('ChevronDownIcon'),
  ChevronLeftIcon: creerIconeMock('ChevronLeftIcon'),
  ChevronRightIcon: creerIconeMock('ChevronRightIcon'),
  ChevronUpIcon: creerIconeMock('ChevronUpIcon'),
  ClockIcon: creerIconeMock('ClockIcon'),
  Cog6ToothIcon: creerIconeMock('Cog6ToothIcon'),
  ExclamationTriangleIcon: creerIconeMock('ExclamationTriangleIcon'),
  EyeIcon: creerIconeMock('EyeIcon'),
  FunnelIcon: creerIconeMock('FunnelIcon'),
  MagnifyingGlassIcon: creerIconeMock('MagnifyingGlassIcon'),
  PlusIcon: creerIconeMock('PlusIcon'),
  TrashIcon: creerIconeMock('TrashIcon'),
  UsersIcon: creerIconeMock('UsersIcon'),
  XMarkIcon: creerIconeMock('XMarkIcon'),
}))

// Mock global recharts - SVG non supporte dans happy-dom
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Line: () => null,
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}))
