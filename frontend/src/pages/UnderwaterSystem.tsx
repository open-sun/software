import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    RadarComponent
} from 'echarts/components';
import { PieChart, RadarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type {
    TitleComponentOption,
    TooltipComponentOption,
    LegendComponentOption,
    PieSeriesOption,
    RadarSeriesOption,
    RadarComponentOption
} from 'echarts';

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    PieChart,
    RadarComponent,
    RadarChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<
    | TitleComponentOption
    | TooltipComponentOption
    | LegendComponentOption
    | PieSeriesOption
    | RadarSeriesOption
    | RadarComponentOption
>;

// 样式常量
const infoItemStyle: React.CSSProperties = {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const cardStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

// 颜色配置
const SPECIES_COLORS = [
    '#7299d1', '#B3E4A1', '#F9713C',
    '#9A5CB4', '#FFD700', '#4ECDC4'
];

interface FishData {
    Species: string;
    'Weight(g)': string;
    'Length1(cm)': string;
    'Length2(cm)': string;
    'Length3(cm)': string;
    'Height(cm)': string;
    'Width(cm)': string;
}

interface ApiResponse {
    result: number;
    tbody: FishData[];
    thead: string[];
    total: number;
}

interface ProcessedFishData {
    Species: string;
    'Weight(g)': number;
    'Length1(cm)': number;
    'Length2(cm)': number;
    'Length3(cm)': number;
    'Height(cm)': number;
    'Width(cm)': number;
}

interface GroupedFishData {
    [species: string]: ProcessedFishData[];
}

// 颜色处理函数
const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
};

const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
};

const UnderwaterSystem: React.FC = () => {
    const [processedData, setProcessedData] = useState<ProcessedFishData[]>([]);
    const [groupedData, setGroupedData] = useState<GroupedFishData>({});
    const [selectedSpecies, setSelectedSpecies] = useState<string>('');
    const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);
    const radarChartRef = useRef<HTMLDivElement>(null);

    // 网箱信息
    const cageInfo = {
        length: '100m',
        width: '50m',
        depth: '30m',
        longitude: '128.034°E',
        latitude: '56.123°N'
    };

    // 传感器数据
    const [sensorData, setSensorData] = useState({
        temperature: 25.6,
        ph: 7.0,
        dissolvedOxygen: 6.2,
        conductivity: 480
    });

    // PH值动态变化
    useEffect(() => {
        const phInterval = setInterval(() => {
            setSensorData(prev => ({
                ...prev,
                ph: parseFloat(
                    Math.min(Math.max(prev.ph + (Math.random() - 0.5) * 0.05, 6.5), 8.5)
                        .toFixed(1)
                )
            }));
        }, 3000);

        return () => clearInterval(phInterval);
    }, []);

    // 数据处理
    const processRawData = useCallback((rawData: FishData[]): ProcessedFishData[] => {
        return rawData.map(fish => ({
            Species: fish.Species,
            'Weight(g)': parseInt(fish['Weight(g)'], 10),
            'Length1(cm)': parseFloat(fish['Length1(cm)']),
            'Length2(cm)': parseFloat(fish['Length2(cm)']),
            'Length3(cm)': parseFloat(fish['Length3(cm)']),
            'Height(cm)': parseFloat(fish['Height(cm)']),
            'Width(cm)': parseFloat(fish['Width(cm)'])
        }));
    }, []);

    const groupBySpecies = useCallback((data: ProcessedFishData[]): GroupedFishData => {
        return data.reduce((acc: GroupedFishData, fish) => {
            const species = fish.Species;
            acc[species] = acc[species] || [];
            acc[species].push(fish);
            return acc;
        }, {});
    }, []);

    // 数据获取
    const fetchFishData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fishdata');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: ApiResponse = await response.json();

            if (data.result !== 1) console.error('Result code异常');
            if (data.total !== 159) console.warn('数据总数不符');

            const cleanedData = processRawData(data.tbody);
            const grouped = groupBySpecies(cleanedData);

            setProcessedData(cleanedData);
            setGroupedData(grouped);
            setSelectedSpecies(Object.keys(grouped)[0] || '');
        } catch (error) {
            console.error('数据获取失败:', error);
        }
    }, [processRawData, groupBySpecies]);

    // 饼图初始化
    useEffect(() => {
        if (!pieChartRef.current || Object.keys(groupedData).length === 0) return;

        const chartData = Object.entries(groupedData).map(([species, items], index) => ({
            value: items.length,
            name: species,
            itemStyle: {
                color: SPECIES_COLORS[index % SPECIES_COLORS.length]
            }
        }));

        const myChart = echarts.init(pieChartRef.current);

        const option: ECOption = {
            title: {
                text: '鱼类物种分布统计',
                subtext: `总样本数：${processedData.length}`,
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a}<br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'middle',
                data: Object.keys(groupedData)
            },
            series: [{
                type: 'pie',
                name: '物种数量',
                radius: ['35%', '60%'],
                center: ['50%', '55%'],
                data: chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}: {c} ({d}%)'
                },
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                }
            }]
        };

        myChart.setOption(option);

        const resizeHandler = () => myChart.resize();
        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
            myChart.dispose();
        };
    }, [groupedData, processedData.length]);

    // 雷达图初始化
    useEffect(() => {
        if (!radarChartRef.current || !selectedSpecies || !groupedData[selectedSpecies]) return;

        const myChart = echarts.init(radarChartRef.current);
        const speciesData = groupedData[selectedSpecies];
        const speciesIndex = Object.keys(groupedData).indexOf(selectedSpecies);
        const color = SPECIES_COLORS[speciesIndex % SPECIES_COLORS.length];

        const calculateAverages = () => {
            const sum = speciesData.reduce((acc, fish) => ({
                'Weight(g)': acc['Weight(g)'] + fish['Weight(g)'],
                'Length1(cm)': acc['Length1(cm)'] + fish['Length1(cm)'],
                'Length2(cm)': acc['Length2(cm)'] + fish['Length2(cm)'],
                'Length3(cm)': acc['Length3(cm)'] + fish['Length3(cm)'],
                'Height(cm)': acc['Height(cm)'] + fish['Height(cm)'],
                'Width(cm)': acc['Width(cm)'] + fish['Width(cm)']
            }), {
                'Weight(g)': 0,
                'Length1(cm)': 0,
                'Length2(cm)': 0,
                'Length3(cm)': 0,
                'Height(cm)': 0,
                'Width(cm)': 0
            });

            const count = speciesData.length;
            return [
                sum['Weight(g)'] / count,
                sum['Length1(cm)'] / count,
                sum['Length2(cm)'] / count,
                sum['Length3(cm)'] / count,
                sum['Height(cm)'] / count,
                sum['Width(cm)'] / count
            ];
        };

        const option: ECOption = {
            title: {
                text: `${selectedSpecies} 形态特征分析`,
                left: 'center',
                textStyle: {
                    color: '#2c3e50'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            radar: {
                indicator: [
                    { name: '体重(g)', max: Math.ceil(Math.max(...speciesData.map(f => f['Weight(g)']))) * 1 },
                    { name: '长度1(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length1(cm)']))) * 1 },
                    { name: '长度2(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length2(cm)']))) * 1 },
                    { name: '长度3(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length3(cm)']))) * 1 },
                    { name: '高度(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Height(cm)']))) * 1 },
                    { name: '宽度(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Width(cm)']))) * 1 }
                ],
                shape: 'polygon',
                splitNumber: 5,
                axisName: {
                    color: '#666',
                    fontSize: 12
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(114, 172, 209, 0.1)']
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(100, 100, 100, 0.3)'
                    }
                }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: calculateAverages(),
                    name: selectedSpecies,
                    areaStyle: {
                        color: hexToRgba(color, 0.3)
                    },
                    lineStyle: {
                        color: color,
                        width: 2
                    },
                    itemStyle: {
                        color: color
                    }
                }]
            }]
        };

        myChart.setOption(option);

        return () => {
            myChart.dispose();
        };
    }, [selectedSpecies, groupedData]);

    useEffect(() => {
        fetchFishData();
    }, [fetchFishData]);

    // 获取物种颜色
    const getSpeciesColor = (species: string): string => {
        const index = Object.keys(groupedData).indexOf(species);
        return SPECIES_COLORS[index % SPECIES_COLORS.length];
    };

    // 按钮样式计算
    const getButtonBackground = (species: string): string => {
        const baseColor = getSpeciesColor(species);
        if (selectedSpecies === species) {
            return hoveredSpecies === species ? darkenColor(baseColor, 20) : baseColor;
        }
        return hoveredSpecies === species ? lightenColor(baseColor, 40) : lightenColor(baseColor, 80);
    };

    const getButtonColor = (species: string): string => {
        return selectedSpecies === species ? 'white' : '#333';
    };

    // PH值颜色指示
    const getPHColor = (ph: number | string) => {
        const numericPH = typeof ph === 'string' ? parseFloat(ph) : ph;
        if (numericPH < 6.5) return '#F44336';
        if (numericPH > 8.5) return '#2196F3';
        return '#4CAF50';
    };

    // PH状态文字说明
    const getPHStatusText = (ph: number | string) => {
        const numericPH = typeof ph === 'string' ? parseFloat(ph) : ph;
        if (numericPH < 6.5) return '酸性过高';
        if (numericPH > 8.5) return '碱性过高';
        if (numericPH > 7.5) return '弱碱性';
        if (numericPH < 7.0) return '弱酸性';
        return '中性';
    };

    return (
        <div className="underwater-system" style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <h2 style={{
                textAlign: 'center',
                color: '#2c3e50',
                marginBottom: '30px'
            }}>
                水下生态系统监测平台
            </h2>

            {/* 设备状态面板 */}
            <div style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {/* 网箱信息卡片 */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                        <span style={{ marginRight: 10 }}>🌊</span>
                        网箱信息
                    </h3>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        <li style={infoItemStyle}>
                            <span>网箱长度:</span>
                            <span>{cageInfo.length}</span>
                        </li>
                        <li style={infoItemStyle}>
                            <span>网箱宽度:</span>
                            <span>{cageInfo.width}</span>
                        </li>
                        <li style={infoItemStyle}>
                            <span>网箱深度:</span>
                            <span>{cageInfo.depth}</span>
                        </li>
                        <li style={infoItemStyle}>
                            <span>经度:</span>
                            <span>{cageInfo.longitude}</span>
                        </li>
                        <li style={{ ...infoItemStyle, borderBottom: 'none' }}>
                            <span>纬度:</span>
                            <span>{cageInfo.latitude}</span>
                        </li>
                    </ul>
                </div>

                {/* 传感器信息卡片 */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                        <span style={{ marginRight: 10 }}>🌡️</span>
                        传感器数据
                    </h3>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        <li style={infoItemStyle}>
                            <span>水温:</span>
                            <span>{sensorData.temperature}°C</span>
                        </li>
                        <li style={infoItemStyle}>
                            <span>PH值:</span>
                            <span style={{
                                color: getPHColor(sensorData.ph),
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {sensorData.ph.toFixed(1)}
                                <span style={{
                                    marginLeft: '8px',
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
                                    ({getPHStatusText(sensorData.ph)})
                                </span>
                            </span>
                        </li>
                        <li style={infoItemStyle}>
                            <span>溶解氧:</span>
                            <span>{sensorData.dissolvedOxygen} mg/L</span>
                        </li>
                        <li style={{ ...infoItemStyle, borderBottom: 'none' }}>
                            <span>导电率:</span>
                            <span>{sensorData.conductivity} μS/cm</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 饼图容器 */}
            <div
                ref={pieChartRef}
                style={{
                    width: '100%',
                    height: '600px',
                    margin: '20px 0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                }}
            />

            {/* 雷达图部分 */}
            <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{
                    textAlign: 'center',
                    color: '#2c3e50',
                    marginBottom: '20px'
                }}>
                    物种形态特征分析
                </h3>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}>
                    {Object.keys(groupedData).map(species => (
                        <button
                            key={species}
                            onClick={() => setSelectedSpecies(species)}
                            onMouseEnter={() => setHoveredSpecies(species)}
                            onMouseLeave={() => setHoveredSpecies(null)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: getButtonBackground(species),
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: getButtonColor(species),
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {species}
                        </button>
                    ))}
                </div>

                <div
                    ref={radarChartRef}
                    style={{
                        width: '100%',
                        height: '500px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                />
            </div>

            {/* 数据摘要 */}
            <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginTop: '20px'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>数据集摘要</h3>
                <ul style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    marginBottom: '20px'
                }}>
                    <li>总样本数: {processedData.length}</li>
                    <li>包含物种数: {Object.keys(groupedData).length}</li>
                    <li>当前选中物种: {selectedSpecies || '未选择'}</li>
                </ul>

                <div>
                    <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>数据样例：</h4>
                    <pre style={{
                        backgroundColor: '#fff',
                        padding: '15px',
                        borderRadius: '6px',
                        overflowX: 'auto',
                        fontSize: '14px',
                        lineHeight: '1.5'
                    }}>
                        {JSON.stringify(processedData.slice(0, 2), null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default UnderwaterSystem;