import type { CardProps } from '@mui/material/Card';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import ReactECharts from 'echarts-for-react';
import { PieSeriesOption } from 'echarts/charts';
import { useMemo } from 'react';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
  };
};

// 本地数字格式化方法
const formatNumber = (value: number) => {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
};

export function AnalyticsCurrentVisits({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  // 颜色配置
  const chartColors = useMemo(() => chart.colors || [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
  ], [chart.colors, theme]);

  // ECharts 配置
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
          <div style="padding: 8px;">
            <div>${params.name}</div>
            <div>${formatNumber(params.value)} (${params.percent}%)</div>
          </div>
        `;
      },
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
      textStyle: {
        color: theme.palette.text.primary,
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      itemGap: 16,
      textStyle: {
        color: theme.palette.text.primary,
      },
    },
    series: [{
      type: 'pie',
      radius: ['50%', '80%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      data: chart.series.map((item, index) => ({
        name: item.label,
        value: item.value,
        itemStyle: {
          color: chartColors[index % chartColors.length]
        }
      })),
    }] as PieSeriesOption[]
  }), [chart.series, chartColors, theme]);

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <ReactECharts
        option={option}
        style={{
          height: 400,
          width: '100%',
          margin: theme.spacing(4, 'auto')
        }}
      />

      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
    </Card>
  );
}