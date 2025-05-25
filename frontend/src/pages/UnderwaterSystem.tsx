import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    RadarComponent,
    GridComponent
} from 'echarts/components';
import { PieChart, RadarChart, GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type {
    TitleComponentOption,
    TooltipComponentOption,
    LegendComponentOption,
    PieSeriesOption,
    RadarSeriesOption,
    RadarComponentOption,
    GaugeSeriesOption
} from 'echarts';

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    PieChart,
    RadarComponent,
    RadarChart,
    GaugeChart,
    CanvasRenderer
]);

type ECOption = ComposeOption<
    | TitleComponentOption
    | TooltipComponentOption
    | LegendComponentOption
    | PieSeriesOption
    | RadarSeriesOption
    | RadarComponentOption
    | GaugeSeriesOption
>;

// 样式常量
const infoItemStyle: React.CSSProperties = {
    padding: '8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#2d3a4b'
};

const cardStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(24,144,255,0.15)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
};

const bluePalette = {
    light: '#e6f7ff',
    primary: '#1890ff',
    dark: '#2a6f9c',
    gradient: 'linear-gradient(145deg, #f0f9ff 0%, #e6f7ff 100%)'
};

// 颜色配置
const SPECIES_COLORS = [
    '#36a2eb', '#ff6384', '#4bc0c0',
    '#ff9f40', '#9966ff', '#ffcd56'
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
    const gaugeChartRef = useRef<HTMLDivElement>(null);

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
        }, 1000);

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

    // 仪表盘初始化
    useEffect(() => {
        if (!gaugeChartRef.current) return;

        const myChart = echarts.init(gaugeChartRef.current);

        const option: ECOption = {
            series: [{
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                center: ['50%', '65%'],
                radius: '90%',
                min: 0,
                max: 1,
                splitNumber: 8,
                axisLine: {
                    lineStyle: {
                        width: 6,
                        color: [
                            [0.25, '#FF6E76'],
                            [0.5, '#FDDD60'],
                            [0.75, '#58D9F9'],
                            [1, '#7CFFB2']
                        ]
                    }
                },
                pointer: {
                    icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                    length: '12%',
                    width: 20,
                    offsetCenter: [0, '-60%'],
                    itemStyle: {
                        color: 'auto'
                    }
                },
                axisTick: {
                    length: 12,
                    lineStyle: {
                        color: 'auto',
                        width: 2
                    }
                },
                splitLine: {
                    length: 20,
                    lineStyle: {
                        color: 'auto',
                        width: 5
                    }
                },
                axisLabel: {
                    color: '#2d3a4b',
                    fontSize: 16,
                    distance: -60,
                    rotate: 'tangential',
                    formatter: function (value: number) {
                        if (value === 0.875) return '优 (A)';
                        if (value === 0.625) return '良 (B)';
                        if (value === 0.375) return '中 (C)';
                        if (value === 0.125) return '差 (D)';
                        return '';
                    }
                },
                title: {
                    offsetCenter: [0, '-10%'],
                    fontSize: 20,
                    color: '#2d3a4b'
                },
                detail: {
                    fontSize: 40,
                    offsetCenter: [0, '-35%'],
                    valueAnimation: true,
                    formatter: function (value: number) {
                        return Math.round(value * 100) + '';
                    },
                    color: '#2d3a4b'
                },
                data: [{
                    value: 0.7,
                    name: '环境综合评分'
                }]
            }]
        };

        myChart.setOption(option);

        return () => {
            myChart.dispose();
        };
    }, []);

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
                left: 'center',
                textStyle: {
                    color: '#2d3a4b'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a}<br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'middle',
                data: Object.keys(groupedData),
                textStyle: {
                    color: '#2d3a4b'
                }
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
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                label: {
                    show: true,
                    formatter: '{b}: {c} ({d}%)',
                    color: '#2d3a4b'
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
                    color: '#2d3a4b'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            radar: {
                indicator: [
                    { name: '体重(g)', max: Math.ceil(Math.max(...speciesData.map(f => f['Weight(g)'])) * 1.1) },
                    { name: '长度1(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length1(cm)'])) * 1.1) },
                    { name: '长度2(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length2(cm)'])) * 1.1) },
                    { name: '长度3(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Length3(cm)'])) * 1.1) },
                    { name: '高度(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Height(cm)'])) * 1.1) },
                    { name: '宽度(cm)', max: Math.ceil(Math.max(...speciesData.map(f => f['Width(cm)'])) * 1.1) }
                ],
                shape: 'polygon',
                splitNumber: 5,
                axisName: {
                    color: '#2d3a4b',
                    fontSize: 12
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(24,144,255,0.05)']
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0,0,0,0.2)'
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
                        width: 3
                    },
                    itemStyle: {
                        color: color,
                        borderWidth: 2
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
        return selectedSpecies === species ? 'white' : '#2d3a4b';
    };

    // PH值颜色指示
    const getPHColor = (ph: number | string) => {
        const numericPH = typeof ph === 'string' ? parseFloat(ph) : ph;
        if (numericPH < 6.5) return '#ff4d4f';
        if (numericPH > 8.5) return '#40a9ff';
        return '#73d13d';
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
            maxWidth: '1400px',
            margin: '0 auto',
            background: bluePalette.gradient,
            minHeight: '100vh'
        }}>
            <h2 style={{
                textAlign: 'center',
                color: '#2d3a4b',
                marginBottom: '30px',
                fontSize: '2.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
                水下生态系统监测平台
            </h2>

            {/* 第一行布局 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }}>
                {/* 左侧：环境评分仪表盘 */}
                <div style={{ ...cardStyle, background: '#f8fbff' }}>
                    <div ref={gaugeChartRef} style={{ width: '100%', height: '360px' }} />
                    <div style={{ padding: '15px', color: '#2d3a4b' }}>
                        <h3 style={{ marginBottom: '12px' }}>评分说明</h3>
                        <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '14px' }}>
                            <li style={{ marginBottom: '8px' }}>A (90-100): 极佳生态环境</li>
                            <li style={{ marginBottom: '8px' }}>B (75-89): 良好生态环境</li>
                            <li style={{ marginBottom: '8px' }}>C (60-74): 一般生态环境</li>
                            <li style={{ marginBottom: '8px' }}>D (0-59): 需改善生态环境</li>
                        </ul>
                        <p style={{ fontSize: '12px', opacity: 0.8 }}>
                            评分依据：水质指标、生物多样性、环境稳定性等综合因素计算
                        </p>
                    </div>
                </div>

                {/* 中间：雷达图 */}
                <div style={{ ...cardStyle, background: '#ffffff' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            textAlign: 'center',
                            color: '#2d3a4b',
                            marginBottom: '15px',
                            fontSize: '1.5rem'
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
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        color: getButtonColor(species),
                                        transition: 'all 0.3s ease',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                                height: '400px',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                </div>

                {/* 右侧：网箱和传感器信息 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ ...cardStyle, background: '#f0f9ff' }}>
                        <h3 style={{ color: '#2d3a4b', marginBottom: '15px' }}>
                            <span style={{ marginRight: 10 }}>🌊</span>
                            网箱信息
                        </h3>
                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                            {Object.entries(cageInfo).map(([key, value]) => (
                                <li key={key} style={infoItemStyle}>
                                    <span>{key}:</span>
                                    <span>{value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ ...cardStyle, background: '#e6f7ff' }}>
                        <h3 style={{ color: '#2d3a4b', marginBottom: '15px' }}>
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
                                        color: '#2d3a4b'
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
            </div>

            {/* 第二行布局 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }}>
                {/* 左侧：数据集摘要 */}
                <div style={{ ...cardStyle, background: '#ffffff' }}>
                    <h3 style={{ color: '#2d3a4b', marginBottom: '15px' }}>数据集摘要</h3>
                    <ul style={{
                        listStyle: 'none',
                        paddingLeft: 0,
                        marginBottom: '20px',
                        fontSize: '16px'
                    }}>
                        <li style={infoItemStyle}>总样本数: {processedData.length}</li>
                        <li style={infoItemStyle}>包含物种数: {Object.keys(groupedData).length}</li>
                        <li style={infoItemStyle}>当前选中物种: {selectedSpecies || '未选择'}</li>
                    </ul>

                    <div>
                        <h4 style={{ color: '#2d3a4b', marginBottom: '10px' }}>数据样例：</h4>
                        <pre style={{
                            backgroundColor: hexToRgba(bluePalette.primary, 0.1),
                            padding: '15px',
                            borderRadius: '6px',
                            overflowX: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            color: '#2d3a4b'
                        }}>
                            {JSON.stringify(processedData.slice(0, 2), null, 2)}
                        </pre>
                    </div>
                </div>

                {/* 右侧：饼图 */}
                <div style={{ ...cardStyle, background: '#f8fbff' }}>
                    <div
                        ref={pieChartRef}
                        style={{
                            width: '100%',
                            height: '500px',
                            borderRadius: '8px'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default UnderwaterSystem;