"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "../ui/button"

const chartData = [
  { time: "10:00", inbound: 186, outbound: 80 },
  { time: "10:05", inbound: 305, outbound: 200 },
  { time: "10:10", inbound: 237, outbound: 120 },
  { time: "10:15", inbound: 73, outbound: 190 },
  { time: "10:20", inbound: 209, outbound: 130 },
  { time: "10:25", inbound: 214, outbound: 140 },
  { time: "10:30", inbound: 384, outbound: 210 },
  { time: "10:35", inbound: 250, outbound: 180 },
  { time: "10:40", inbound: 320, outbound: 250 },
  { time: "10:45", inbound: 280, outbound: 200 },
  { time: "10:50", inbound: 420, outbound: 310 },
  { time: "10:55", inbound: 350, outbound: 280 },
  { time: "11:00", inbound: 480, outbound: 350 },
]

const chartConfig = {
  inbound: {
    label: "Inbound",
    color: "hsl(var(--chart-1))",
  },
  outbound: {
    label: "Outbound",
    color: "hsl(var(--chart-2))",
  },
}

export function NetworkTrafficChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>Inbound/Outbound over last hour</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="bg-accent">1H</Button>
            <Button variant="ghost" size="sm">24H</Button>
            <Button variant="ghost" size="sm">7D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 20,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="inbound"
              type="monotone"
              stroke="var(--color-inbound)"
              strokeWidth={2}
              dot={false}
            />
             <Line
              dataKey="outbound"
              type="monotone"
              stroke="var(--color-outbound)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
