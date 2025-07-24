"use client"
import {
  Bar,
  BarChart as BarChartPrimitive,
  Line,
  LineChart as LineChartPrimitive,
  Pie,
  PieChart as PieChartPrimitive,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"
import { ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"

// Define types for common chart props
interface BaseChartProps {
  data: Record<string, unknown>[]
  categories: string[]
  index: string
  colors?: string[]
  className?: string
}

interface BarChartProps extends BaseChartProps {
  layout?: "horizontal" | "vertical"
}

interface LineChartProps extends BaseChartProps {
  curveType?: "linear" | "natural" | "monotone"
}

interface PieChartProps extends BaseChartProps {
  nameKey: string
  valueKey: string
  outerRadius?: number
  innerRadius?: number
}

// Bar Chart Component
const BarChart = ({
  data,
  categories,
  index,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
  className,
  layout = "horizontal",
  ...props
}: BarChartProps) => {
  // Chart configuration for potential future use
  // const chartConfig: Record<string, { label: string; color: string }> = categories.reduce((acc, category, i) => {
  //   acc[category] = {
  //     label: category,
  //     color: colors[i % colors.length],
  //   }
  //   return acc
  // }, {})

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <BarChartPrimitive data={data} layout={layout} {...props}>
        <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} radius={4} />
        ))}
      </BarChartPrimitive>
    </div>
  )
}

// Line Chart Component
const LineChart = ({
  data,
  categories,
  index,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
  className,
  curveType = "monotone",
  ...props
}: LineChartProps) => {
  // Chart configuration for potential future use
  // const chartConfig: Record<string, { label: string; color: string }> = categories.reduce((acc, category, i) => {
  //   acc[category] = {
  //     label: category,
  //     color: colors[i % colors.length],
  //   }
  //   return acc
  // }, {})

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <LineChartPrimitive data={data} {...props}>
        <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        {categories.map((category, i) => (
          <Line
            key={category}
            dataKey={category}
            stroke={colors[i % colors.length]}
            type={curveType}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChartPrimitive>
    </div>
  )
}

// Pie Chart Component
const PieChart = ({
  data,
  nameKey,
  valueKey,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
  className,
  outerRadius = 100,
  innerRadius = 0,
  ...props
}: PieChartProps) => {
  // Chart configuration for potential future use
  // const chartConfig: Record<string, { label: string; color: string }> = data.reduce((acc, entry, i) => {
  //   acc[entry[nameKey]] = {
  //     label: entry[nameKey],
  //     color: colors[i % colors.length],
  //   }
  //   return acc
  // }, {})

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <PieChartPrimitive {...props}>
        <Tooltip content={<ChartTooltipContent nameKey={nameKey} />} />
        <Legend content={<ChartLegendContent />} />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChartPrimitive>
    </div>
  )
}

// Export the custom chart components
export { BarChart, LineChart, PieChart }
