"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "../ui/button"

const chartData = [
  { time: "10:00", value: 120 },
  { time: "10:05", value: 100 },
  { time: "10:10", value: 110 },
  { time: "10:15", value: 90 },
  { time: "10:20", value: 120 },
  { time: "10:25", value: 80 },
  { time: "10:30", value: 60 },
  { time: "10:35", value: 90 },
  { time: "10:40", value: 50 },
  { time: "10:45", value: 70 },
  { time: "10:50", value: 40 },
  { time: "10:55", value: 60 },
]

const chartConfig = {
  value: {
    label: "Traffic",
    color: "hsl(var(--primary))",
  },
}

export function NetworkTrafficChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
            <div>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Inbound/Outbound over last hour</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-background rounded-lg p-1">
                <Button size="sm" className="px-3 py-1 text-xs font-medium rounded bg-secondary text-white shadow-sm h-auto">1H</Button>
                <Button variant="ghost" size="sm" className="px-3 py-1 text-xs font-medium rounded text-muted-foreground hover:text-white h-auto">24H</Button>
                <Button variant="ghost" size="sm" className="px-3 py-1 text-xs font-medium rounded text-muted-foreground hover:text-white h-auto">7D</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--muted) / 0.5)" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
              className="text-xs text-muted-foreground font-medium"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
              strokeWidth={3}
              dot={false}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
