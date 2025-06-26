import React, { useState, useEffect } from 'react';
import {
  Box, Typography, ListItemButton, ListItemText, Divider,
  useMediaQuery, useTheme, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert
} from '@mui/material';
import AiTalk from '../components/SmartCenter/AiTalk';
import ImageRecognizer from '../components/SmartCenter/ImageRecognizer';
import FarmingAdvice from '../components/SmartCenter/FileRecognizer';

// 定义鱼类数据结构
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

interface PredictionResult {
  [key: string]: number;
}

const DIMENSIONS = [
  'Weight(g)',
  'Length1(cm)',
  'Length2(cm)',
  'Length3(cm)',
  'Height(cm)',
  'Width(cm)'
];

const SmartCenter: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState('智能问答');
  const features = ['智能问答', '鱼类体长预测', '图片识别', '运动轨迹追踪', '养殖建议'];

  // 鱼类体长预测相关状态
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedDimension, setSelectedDimension] = useState('Weight(g)');
  const [inputValue, setInputValue] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fishData, setFishData] = useState<ProcessedFishData[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 获取鱼类数据
  useEffect(() => {
    const fetchFishData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/fishdata');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.result !== 1) {
          throw new Error('API returned error result');
        }

        // 处理数据：转换字符串为数字
        const processed = data.tbody.map(fish => ({
          Species: fish.Species,
          'Weight(g)': parseInt(fish['Weight(g)'], 10),
          'Length1(cm)': parseFloat(fish['Length1(cm)']),
          'Length2(cm)': parseFloat(fish['Length2(cm)']),
          'Length3(cm)': parseFloat(fish['Length3(cm)']),
          'Height(cm)': parseFloat(fish['Height(cm)']),
          'Width(cm)': parseFloat(fish['Width(cm)'])
        }));

        setFishData(processed);

        // 获取唯一的物种列表
        const uniqueSpecies = Array.from(new Set(processed.map(fish => fish.Species)));
        setSpeciesList(uniqueSpecies);

        // 设置默认选中的物种
        if (uniqueSpecies.length > 0) {
          setSelectedSpecies(uniqueSpecies[0]);
        }

      } catch (err) {
        console.error('数据获取失败:', err);
        setError('数据加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFishData();
  }, []);

  // 处理预测请求
  const handlePredict = () => {
    if (!selectedSpecies || !inputValue) {
      setError('请选择物种并输入有效数值');
      return;
    }

    try {
      const numericValue = parseFloat(inputValue);
      if (isNaN(numericValue)) {
        throw new Error('请输入有效的数值');
      }

      // 获取该物种的所有数据
      const speciesData = fishData.filter(fish => fish.Species === selectedSpecies);

      if (speciesData.length === 0) {
        throw new Error('没有找到该物种的数据');
      }

      // 计算每个维度的平均值
      const averages: PredictionResult = {};
      DIMENSIONS.forEach(dim => {
        const sum = speciesData.reduce((acc, fish) => acc + Number(fish[dim as keyof ProcessedFishData]), 0);
        averages[dim] = sum / speciesData.length;
      });

      // 计算输入维度与其他维度的比例
      const inputAvg = averages[selectedDimension];
      if (inputAvg === 0) {
        throw new Error('无法计算比例，平均值不能为零');
      }

      const ratio = numericValue / inputAvg;

      // 预测其他维度值
      const predictionResult: PredictionResult = {};
      DIMENSIONS.forEach(dim => {
        if (dim !== selectedDimension) {
          predictionResult[dim] = averages[dim] * ratio;
        }
      });

      setPrediction(predictionResult);
      setError('');
    } catch (err: any) {
      console.error('预测失败:', err);
      setError(err.message || '预测失败，请检查输入');
      setPrediction(null);
    }
  };

  const handleSelectFeature = (feature: string) => {
    setSelectedFeature(feature);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        p: isMobile ? 2 : 4,
      }}
    >
      {/* 左侧菜单栏 */}
      <Box
        sx={{
          width: isMobile ? '100%' : '20%',
          backgroundColor: '#ffffff',
          p: 2,
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          mb: isMobile ? 2 : 0,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
          智能中心
        </Typography>
        {features.map((feature) => (
          <ListItemButton
            key={feature}
            onClick={() => handleSelectFeature(feature)}
            sx={{
              backgroundColor: selectedFeature === feature ? '#e3f2fd' : 'transparent',
              borderRadius: '8px',
              mb: 1,
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <ListItemText
              primary={feature}
              sx={{ color: '#1976d2', fontWeight: selectedFeature === feature ? 'bold' : 'normal' }}
            />
          </ListItemButton>
        ))}
      </Box>

      {/* 右侧功能展示区 */}
      <Box
        sx={{
          flex: 1,
          ml: isMobile ? 0 : 4,
          backgroundColor: '#ffffff',
          p: 3,
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          width: isMobile ? '100%' : 'auto',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>
          {selectedFeature}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box>
          {selectedFeature === '智能问答' && <AiTalk />}

          {selectedFeature === '鱼类体长预测' && (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                基于历史数据的鱼类维度预测
              </Typography>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>加载鱼类数据中...</Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
                <TextField
                  select
                  label="选择鱼类物种"
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  fullWidth
                  disabled={loading || speciesList.length === 0}
                >
                  {speciesList.map(species => (
                    <MenuItem key={species} value={species}>
                      {species}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="选择输入维度"
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value)}
                  fullWidth
                  disabled={loading}
                >
                  {DIMENSIONS.map(dim => (
                    <MenuItem key={dim} value={dim}>
                      {dim}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="输入数值"
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  fullWidth
                  disabled={loading}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handlePredict}
                disabled={loading}
                fullWidth
                sx={{ py: 1.5, mb: 3 }}
              >
                预测其他维度
              </Button>

              {prediction && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    预测结果
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    基于 {selectedSpecies} 的历史数据，当 {selectedDimension} = {inputValue} 时：
                  </Typography>

                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                          <TableCell>维度</TableCell>
                          <TableCell align="right">预测值</TableCell>
                          <TableCell align="right">单位</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(prediction).map(([dimension, value]) => (
                          <TableRow key={dimension}>
                            <TableCell>{dimension}</TableCell>
                            <TableCell align="right">{value.toFixed(2)}</TableCell>
                            <TableCell align="right">{dimension.includes('(g)') ? '克' : '厘米'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: '#666' }}>
                    注：预测基于该物种历史数据的平均值比例关系，实际数值可能存在差异
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {selectedFeature === '图片识别' && <ImageRecognizer />}
          {selectedFeature === '运动轨迹追踪' && (
            <Typography variant="body1">此处为运动轨迹追踪功能的内容展示区域。</Typography>
          )}
          {selectedFeature === '养殖建议' && <FarmingAdvice />}
        </Box>
      </Box>
    </Box>
  );
};

export default SmartCenter;