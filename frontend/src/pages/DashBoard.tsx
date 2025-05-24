
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {AnalyticsCurrentVisits} from '../components/Example/example1'
import {AnalyticsWidgetSummary} from '../components/Example/example2'
import {AnalyticsWebsiteVisits} from '../components/Example/example3'
import {Box} from '@mui/material';
import '../index.css'

// ----------------------------------------------------------------------

const Dashboard: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#e3f2fd', // 背景颜色
        minHeight: '100vh', // 保证背景覆盖整个页面
        padding: 3, // 外边距
        backgroundSize: 'cover', // 背景图覆盖整个容器
      }}
    >
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>


        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <AnalyticsWidgetSummary
            title="Active Users"
            total={128456}
            percent={0.12}
            color="info"
            icon="tabler:user"
            chart={{
                series: [100, 120, 150, 170, 180, 190, 220],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }}
            />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <AnalyticsWidgetSummary
            title="Active Users"
            total={128456}
            percent={0.12}
            color="info"
            icon="tabler:user"
            chart={{
                series: [100, 120, 150, 170, 180, 190, 220],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }}
            />
        </Grid>


        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <AnalyticsWidgetSummary
            title="Active Users"
            total={128456}
            percent={0.12}
            color="info"
            icon="tabler:user"
            chart={{
                series: [100, 120, 150, 170, 180, 190, 220],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }}
            />
        </Grid>

         <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <AnalyticsWidgetSummary
            title="Active Users"
            total={128456}
            percent={0.12}
            color="info"
            icon="tabler:user"
            chart={{
                series: [100, 120, 150, 170, 180, 190, 220],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }}
            />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
         <AnalyticsWebsiteVisits
            title="Website Visits"
            subheader="(+43%) than last year"
            chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                series: [
                {
                    name: 'Visits',
                    data: [4400, 5400, 6500, 7000, 8200, 9100],
                },
                {
                    name: 'Returning',
                    data: [2200, 2800, 3000, 3900, 4300, 5200],
                },
                ],
            }}
            />

        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
         <AnalyticsWebsiteVisits
            title="Website Visits"
            subheader="(+43%) than last year"
            chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                series: [
                {
                    name: 'Visits',
                    data: [4400, 5400, 6500, 7000, 8200, 9100],
                },
                {
                    name: 'Returning',
                    data: [2200, 2800, 3000, 3900, 4300, 5200],
                },
                ],
            }}
            />
        </Grid>
         <Grid size={{ xs: 12, md: 6, lg: 4 }}>
         <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;