import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    RadarComponent,
    GridComponent
} from 'echarts/components';
import { PieChart, RadarChart, GaugeChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type {
    TitleComponentOption,
    TooltipComponentOption,
    LegendComponentOption,
    PieSeriesOption,
    RadarSeriesOption,
    RadarComponentOption,
    GaugeSeriesOption,
    LineSeriesOption
} from 'echarts';
import { Layout, Card, Row, Col, Button, Select, Typography, Divider, Tag, Tooltip, Upload, message, Modal, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, ReloadOutlined, CloudServerOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

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
    LineChart,
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
    | LineSeriesOption
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
    from_cache: boolean;
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

interface DistributionData {
    mean: number;
    stdDev: number;
    points: Array<{ value: number; density: number }>;
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

// 添加缓存状态接口
interface CacheStatus {
    has_cache: boolean;
    cache_timestamp: string | null;
    rows_count: number;
}

const UnderwaterSystem: React.FC = () => {
    const [processedData, setProcessedData] = useState<ProcessedFishData[]>([]);
    const [groupedData, setGroupedData] = useState<GroupedFishData>({});
    const [selectedSpecies, setSelectedSpecies] = useState<string>('');
    const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);
    const [selectedDimension, setSelectedDimension] = useState<string>('Weight(g)');
    const [selectedSpeciesForDistribution, setSelectedSpeciesForDistribution] = useState<string>('');
    const [distributionData, setDistributionData] = useState<DistributionData | null>(null);

    // 添加缓存相关状态
    const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
        has_cache: false,
        cache_timestamp: null,
        rows_count: 0
    });
    const [isUsingCache, setIsUsingCache] = useState<boolean>(false);
    const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);

    const pieChartRef = useRef<HTMLDivElement>(null);
    const radarChartRef = useRef<HTMLDivElement>(null);
    const gaugeChartRef = useRef<HTMLDivElement>(null);
    const distributionChartRef = useRef<HTMLDivElement>(null);

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

    // 维度列表
    const DIMENSIONS = [
        'Weight(g)',
        'Length1(cm)',
        'Length2(cm)',
        'Length3(cm)',
        'Height(cm)',
        'Width(cm)'
    ];

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

    // 生成正态分布数据（修改后）
    const generateNormalDistributionData = (
        species: string,
        dimension: string,
        groupedDataOverride?: GroupedFishData
    ): DistributionData => {
        const dataGroup = groupedDataOverride || groupedData;
        const dataPoints = dataGroup[species]?.map(fish =>
            parseFloat(fish[dimension as keyof ProcessedFishData]?.toString() || "0")
        ) || [];

        const mean = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
        const stdDev = Math.sqrt(
            dataPoints.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / dataPoints.length
        );

        const points = [];
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        const step = (max - min) / 100;

        for (let x = min - 3 * stdDev; x <= max + 3 * stdDev; x += step) {
            const density =
                (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
                Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
            points.push({ value: x, density });
        }

        return { mean, stdDev, points };
    };

    // 获取缓存状态
    const fetchCacheStatus = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fishdata/cache/status');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const status = await response.json();
            setCacheStatus(status);
            
            // 如果有缓存，默认使用缓存数据
            if (status.has_cache) {
                setIsUsingCache(true);
            }
        } catch (error) {
            console.error('获取缓存状态失败:', error);
        }
    }, []);

    // 清除缓存
    const clearCache = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fishdata/cache/clear', {
                method: 'POST',
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            if (result.result === 1) {
                message.success('缓存已成功清除');
                fetchCacheStatus();
                setIsUsingCache(false);
                // 重新获取原始数据
                fetchFishData();
            }
        } catch (error) {
            console.error('清除缓存失败:', error);
            message.error('清除缓存失败');
        }
    }, []);

    // 修改数据获取函数
    const fetchFishData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fishdata');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data: ApiResponse = await response.json();

            if (data.result !== 1) console.error('Result code异常');
            
            // 检查数据是否来自缓存
            if (data.from_cache) {
                setIsUsingCache(true);
                message.info('正在使用缓存数据');
            } else {
                setIsUsingCache(false);
            }

            const cleanedData = processRawData(data.tbody);
            const grouped = groupBySpecies(cleanedData);

            setProcessedData(cleanedData);
            setGroupedData(grouped);

            // 设置初始选中物种
            const initialSpecies = Object.keys(grouped)[0] || '';
            setSelectedSpecies(initialSpecies);
            setSelectedSpeciesForDistribution(initialSpecies);

            // 生成初始分布数据
            if (initialSpecies) {
                const initialData = generateNormalDistributionData(
                    initialSpecies,
                    'Weight(g)',
                    grouped
                );
                setDistributionData(initialData);
            }
            
            // 更新缓存状态
            fetchCacheStatus();
        } catch (error) {
            console.error('数据获取失败:', error);
            message.error('数据获取失败');
        }
    }, [processRawData, groupBySpecies, fetchCacheStatus]);

    // 文件上传处理
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.error('请先选择文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);
        
        setUploading(true);

        try {
            const response = await fetch('http://localhost:5000/api/fishdata/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.result === 1) {
                message.success(`上传成功，共${result.total}条数据`);
                setFileList([]);
                setUploadModalVisible(false);
                
                // 重新获取数据和缓存状态
                fetchFishData();
                fetchCacheStatus();
            }
        } catch (error) {
            console.error('上传失败:', error);
            message.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
            setUploading(false);
        }
    };

    // 文件下载处理
    const handleDownload = () => {
        // 创建一个隐藏的a标签用于下载
        const a = document.createElement('a');
        a.href = `http://localhost:5000/api/fishdata/download?use_cache=${isUsingCache}`;
        a.download = isUsingCache ? 'fish_data_cache.csv' : 'Fish.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        message.success(`正在下载${isUsingCache ? '缓存' : '原始'}数据`);
    };

    // 上传组件属性
    const uploadProps: UploadProps = {
        onRemove: file => {
            setFileList([]);
        },
        beforeUpload: file => {
            // 验证文件类型
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                message.error('只能上传CSV文件!');
                return Upload.LIST_IGNORE;
            }
            
            setFileList([file]);
            return false;
        },
        fileList,
    };

    // 初始化
    useEffect(() => {
        fetchFishData();
        fetchCacheStatus();
    }, [fetchFishData, fetchCacheStatus]);

    // 处理维度选择
    const handleDimensionSelect = (dimension: string) => {
        setSelectedDimension(dimension);
        if (selectedSpeciesForDistribution) {
            const data = generateNormalDistributionData(selectedSpeciesForDistribution, dimension);
            setDistributionData(data);
        }
    };

    // 处理物种选择
    const handleSpeciesSelect = (species: string) => {
        setSelectedSpeciesForDistribution(species);
        if (selectedDimension) {
            const data = generateNormalDistributionData(species, selectedDimension);
            setDistributionData(data);
        }
    };

    // 正态分布图表初始化
    useEffect(() => {
        if (!distributionChartRef.current || !distributionData) return;

        const myChart = echarts.init(distributionChartRef.current);
        const speciesIndex = Object.keys(groupedData).indexOf(selectedSpeciesForDistribution);
        const color = SPECIES_COLORS[speciesIndex % SPECIES_COLORS.length] || bluePalette.primary;

        const option: ECOption = {
            title: {
                text: '正态分布分析',
                left: 'center',
                textStyle: {
                    color: '#2d3a4b',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const data = params[0].data;
                    return `值: ${data[0].toFixed(2)}<br/>密度: ${data[1].toFixed(4)}`;
                }
            },
            xAxis: {
                type: 'value',
                name: selectedDimension,
                axisLine: {
                    lineStyle: {
                        color: '#2d3a4b'
                    }
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                name: '概率密度',
                axisLine: {
                    lineStyle: {
                        color: '#2d3a4b'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                }
            },
            series: [{
                type: 'line',
                data: distributionData.points.map(p => [p.value, p.density]),
                smooth: true,
                lineStyle: {
                    color: color,
                    width: 2
                },
                areaStyle: {
                    color: hexToRgba(color, 0.3)
                },
                symbol: 'none'
            }],
            grid: {
                containLabel: true,
                left: '60px',
                right: '20px',
                top: '50px',
                bottom: '40px'
            }
        };

        myChart.setOption(option);

        return () => myChart.dispose();
    }, [distributionData, selectedDimension, selectedSpeciesForDistribution]);

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

    // 添加数据管理组件
    const renderDataManagement = () => (
        <Card title="数据管理" style={{ ...cardStyle, marginBottom: '20px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Typography.Text strong>数据源状态: </Typography.Text>
                                {isUsingCache ? (
                                    <Tag color="blue" icon={<CloudServerOutlined />}>使用缓存数据</Tag>
                                ) : (
                                    <Tag color="green">使用原始数据</Tag>
                                )}
                            </div>
                            <Button 
                                type="primary" 
                                icon={<ReloadOutlined />} 
                                onClick={fetchFishData}
                            >
                                刷新数据
                            </Button>
                        </div>
                        
                        {cacheStatus.has_cache && (
                            <div>
                                <Typography.Text type="secondary">
                                    缓存时间: {new Date(cacheStatus.cache_timestamp || '').toLocaleString()}
                                </Typography.Text>
                                <br />
                                <Typography.Text type="secondary">
                                    缓存数据量: {cacheStatus.rows_count} 条
                                </Typography.Text>
                            </div>
                        )}
                        
                        <Divider style={{ margin: '12px 0' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    icon={<UploadOutlined />}
                                    onClick={() => setUploadModalVisible(true)}
                                >
                                    上传数据
                                </Button>
                                <Button 
                                    icon={<DownloadOutlined />}
                                    onClick={handleDownload}
                                >
                                    下载{isUsingCache ? '缓存' : '原始'}数据
                                </Button>
                            </Space>
                            
                            {cacheStatus.has_cache && (
                                <Tooltip title="清除缓存，恢复使用原始数据">
                                    <Button 
                                        danger 
                                        icon={<DeleteOutlined />}
                                        onClick={clearCache}
                                    >
                                        清除缓存
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </Space>
                </Col>
            </Row>
            
            {/* 上传模态框 */}
            <Modal
                title="上传数据文件"
                open={uploadModalVisible}
                onCancel={() => {
                    setUploadModalVisible(false);
                    setFileList([]);
                }}
                footer={[
                    <Button key="back" onClick={() => {
                        setUploadModalVisible(false);
                        setFileList([]);
                    }}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={uploading}
                        onClick={handleUpload}
                    >
                        上传
                    </Button>,
                ]}
            >
                <Typography.Paragraph>
                    请上传CSV格式的鱼类数据文件，文件必须包含以下字段：
                    Species, Weight(g), Length1(cm), Length2(cm), Length3(cm), Height(cm), Width(cm)
                </Typography.Paragraph>
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
            </Modal>
        </Card>
    );

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
                水下生态系统监测
            </Typography.Title>

            {/* 添加数据管理组件 */}
            {renderDataManagement()}
            
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
                {/* 分布分析卡片 */}
                <div style={{ ...cardStyle, background: '#ffffff' }}>
                    <h3 style={{ color: '#2d3a4b', marginBottom: '15px' }}>分布分析</h3>

                    {/* 物种选择按钮行 */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: '20px'
                    }}>
                        {Object.keys(groupedData).map((species, index) => (
                            <button
                                key={species}
                                onClick={() => handleSpeciesSelect(species)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: selectedSpeciesForDistribution === species
                                        ? SPECIES_COLORS[index % SPECIES_COLORS.length]
                                        : hexToRgba(SPECIES_COLORS[index % SPECIES_COLORS.length], 0.1),
                                    color: selectedSpeciesForDistribution === species ? 'white' : '#2d3a4b',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {species}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        {/* 维度选择侧边栏 */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minWidth: '120px'
                        }}>
                            {DIMENSIONS.map(dim => (
                                <button
                                    key={dim}
                                    onClick={() => handleDimensionSelect(dim)}
                                    style={{
                                        padding: '8px',
                                        textAlign: 'left',
                                        backgroundColor: selectedDimension === dim
                                            ? bluePalette.primary
                                            : hexToRgba(bluePalette.primary, 0.1),
                                        color: selectedDimension === dim ? 'white' : '#2d3a4b',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {dim}
                                </button>
                            ))}
                        </div>

                        {/* 分布图表 */}
                        <div
                            ref={distributionChartRef}
                            style={{
                                flex: 1,
                                height: '400px',
                                minWidth: '600px'
                            }}
                        >
                            {!distributionData && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#666'
                                }}>
                                    请先选择物种和维度
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 统计信息 */}
                    {distributionData && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: hexToRgba(bluePalette.primary, 0.1),
                            borderRadius: '8px'
                        }}>
                            <h4 style={{ color: '#2d3a4b', marginBottom: '10px' }}>统计参数</h4>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div>
                                    <span style={{ color: '#666' }}>均值: </span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {distributionData.mean.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: '#666' }}>标准差: </span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {distributionData.stdDev.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
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