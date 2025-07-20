'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface RadarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      pointBackgroundColor: string
      pointBorderColor: string
      pointRadius: number
    }[]
  }
  options?: any
}

export function RadarChart({ data, options = {} }: RadarChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}点`
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 11,
          },
          color: '#374151',
        },
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 5,
          stepSize: 1,
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return (
    <div className="w-full h-96">
      <Radar data={data} options={mergedOptions} />
    </div>
  )
}