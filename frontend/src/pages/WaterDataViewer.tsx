import React, { useEffect, useState } from 'react';
import { getTimeWaterData } from '../services/DataGet';

const WaterDataViewer: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getTimeWaterData('2021-01-01').then(setData).catch(console.error);
  }, []);

  return (
    <div>
      <h2>水质数据展示</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>正在加载数据...</p>
      )}
    </div>
  );
};

export default WaterDataViewer;
