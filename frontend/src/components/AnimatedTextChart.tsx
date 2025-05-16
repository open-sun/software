// src/components/AnimatedTextChart.tsx
import React from 'react';
import ReactECharts from 'echarts-for-react';

interface AnimatedTextChartProps {
  text: string;
  fontSize?: number;
  color?: string;
  stroke?: string;
  lineWidth?: number;
}

const AnimatedTextChart: React.FC<AnimatedTextChartProps> = ({
  text,
  fontSize = 80,
  color = 'black',
  stroke = '#000',
  lineWidth = 1
}) => {
  const option = {
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text,
            fontSize,
            fontWeight: 'bold',
            lineDash: [0, 200],
            lineDashOffset: 0,
            fill: 'transparent',
            stroke,
            lineWidth
          },
          keyframeAnimation: {
            duration: 6000,
            loop: false,
            keyframes: [
              {
                percent: 0.7,
                style: {
                  fill: 'transparent',
                  lineDashOffset: 200,
                  lineDash: [200, 0]
                }
              },
              {
                percent: 0.8,
                style: {
                  fill: 'transparent'
                }
              },
              {
                percent: 1,
                style: {
                  fill: color
                }
              }
            ]
          }
        }
      ]
    }
  };

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
};

export default AnimatedTextChart;
