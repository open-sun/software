import type { CardProps } from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ReactECharts from 'echarts-for-react';

// ----------------------------------------------------------------------

type Color = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

type Props = CardProps & {
  title: string;
  total: number;
  percent: number;
  color?: Color;
  icon: React.ReactNode;
  chart: {
    series: number[];
    categories: string[];
  };
};

// 本地格式化方法
const formatNumber = (num: number) => num.toLocaleString();
const formatPercent = (num: number) => `${(num * 100).toFixed(1)}%`;
const shortenNumber = (num: number) => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

export function AnalyticsWidgetSummary({
  sx,
  icon,
  title,
  total,
  chart,
  percent,
  color = 'primary',
  ...other
}: Props) {
  const theme = useTheme();

  const chartData = chart.series;
  const chartLabels = chart.categories;

  const option = {
    xAxis: {
      type: 'category',
      data: chartLabels,
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      borderRadius: theme.shape.borderRadius,
      formatter: (params: any) => {
        const value = params?.[0]?.value ?? 0;
        return formatNumber(value);
      },
    },
    series: [
      {
        data: chartData,
        type: 'line',
        smooth: true,
        lineStyle: {
          color: theme.palette[color].dark,
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          color: theme.palette[color].light,
          opacity: 0.3,
        },
      },
    ],
  };

  return (
    <Card
      sx={[
        {
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: `${color}.darker`,
          backgroundColor: 'common.white',
          backgroundImage: `linear-gradient(135deg, ${theme.palette[color].light}7A, ${theme.palette[color].light}7A)`
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {/* 趋势指示器 */}
      <Box
        sx={{
          top: 16,
          right: 16,
          gap: 0.5,
          display: 'flex',
          position: 'absolute',
          alignItems: 'center'
        }}
      >
        {percent < 0 ? (
          <ArrowDownward sx={{ color: 'error.main' }} />
        ) : (
          <ArrowUpward sx={{ color: 'success.main' }} />
        )}
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {formatPercent(percent)}
        </Box>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
      }}>
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
          <Box sx={{ typography: 'h4' }}>{shortenNumber(total)}</Box>
        </Box>

        {/* 替换成 ECharts 图表 */}
        <Box sx={{ width: 84, height: 56 }}>
          <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
        </Box>
      </Box>

      {/* 背景装饰 */}
      <Box
        sx={{
          top: 0,
          left: -20,
          width: 240,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          zIndex: -1,
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${theme.palette[color].main} 10px,
            ${theme.palette[color].main} 20px
          )`
        }}
      />
    </Card>
  );
}
