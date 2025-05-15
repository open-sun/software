import LineAreaChart from '../components/LineAreaChart';

const myData: [string, number][] = [
  ['04-01 08:00', 553.0],
  ['04-01 12:00', 555.0],
  ['04-01 16:00', 554.0],
  ['04-01 20:00', 560.0],
  ['04-02 00:00', 567.0],
  ['04-02 04:00', 558.0],
  ['04-02 08:00', 547.0],
  ['04-02 12:00', 552.0],
  ['04-02 16:00', 558.0],
  ['04-02 20:00', 569.0]
];

export default function DemoPage() {
  return (
    <LineAreaChart
      data={myData}
      title="电导率(μS/cm) 随时间变化"
      yName="电导率(μS/cm)"
      seriesName="电导率(μS/cm)"
    />
  );
}