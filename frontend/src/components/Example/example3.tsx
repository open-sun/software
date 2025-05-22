import type { CardProps } from '@mui/material/Card';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import ReactECharts from 'echarts-for-react';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
};

export function AnalyticsWebsiteVisits({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
  ];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) =>
        params.map((item: any) => `${item.seriesName}: ${item.value} visits`).join('<br />'),
    },
    legend: {
      top: '5%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chart.categories,
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
    },
    series: chart.series.map((s, idx) => ({
      ...s,
      type: 'bar',
      itemStyle: {
        color: chartColors[idx % chartColors.length],
      },
    })),
  };

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ height: 364, px: 2.5, pb: 2.5, pt: 1 }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </Box>
    </Card>
  );
}
