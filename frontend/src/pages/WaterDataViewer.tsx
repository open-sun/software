import React, { useEffect, useState } from 'react';
import { getTimeWaterData, getWaterDataByName } from '../services/DataGet';

const WaterDataViewer: React.FC = () => {
  const [timeWaterData, setTimeWaterData] = useState<any>(null);
  const [siteWaterData, setSiteWaterData] = useState<any>(null);

  useEffect(() => {
    // 获取时间相关的水质数据
    getTimeWaterData('2021-01-01')
      .then(setTimeWaterData)
      .catch(console.error);

    // 获取站点相关的水质数据
    getWaterDataByName('吉林省', '松花江流域', '')
      .then(setSiteWaterData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>水质数据展示</h2>

      {/* 时间相关的水质数据
      <section>
        <h3>时间相关水质数据</h3>
        {timeWaterData ? (
          <pre>{JSON.stringify(timeWaterData, null, 2)}</pre>
        ) : (
          <p>正在加载时间相关数据...</p>
        )}
      </section> */}

{/* 站点相关的水质数据 */}
    <section>
      <h3>站点相关的水质数据</h3>
      {siteWaterData && siteWaterData.files ? (
        siteWaterData.files.map((file: any, fileIdx: number) => (
          <div key={fileIdx}>
            <h4>{file.file}</h4>
            <table>
              <thead>
                <tr>
                  {file.thead.map((col: string, idx: number) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {file.tbody.map((row: any, rowIdx: number) => (
                  <tr key={rowIdx}>
                    {file.thead.map((col: string) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>正在加载站点相关数据...</p>
      )}
    </section>
    </div>
  );
};

export default WaterDataViewer;