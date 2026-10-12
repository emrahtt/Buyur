'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const config = {
  requests: { label: 'Talep', color: 'var(--chart-1)' },
  offers: { label: 'Teklif', color: 'var(--chart-2)' },
} satisfies ChartConfig

const dayFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })

export function DailyChart({ data }: { data: { day: string; requests: number; offers: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tickFormatter={(v: string) => dayFmt.format(new Date(`${v}T12:00:00`))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent labelFormatter={(v) => dayFmt.format(new Date(`${String(v)}T12:00:00`))} />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
        <Bar dataKey="offers" fill="var(--color-offers)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
