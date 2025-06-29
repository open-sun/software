import React, { useState, useEffect } from "react";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Grid, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { getWaterQualityData, addWaterQualityData, deleteWaterQualityData, updateWaterQualityData } from "../../services/waterQuality";

const WaterQualityManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [newWaterQuality, setNewWaterQuality] = useState<any>({
    province: '',
    river_basin: '',
    section_name: '',
    monitoring_time: '',
    water_quality_category: '',
    temperature: '',
    ph: '',
    dissolved_oxygen: '',
    conductivity: '',
    turbidity: '',
    permanganate_index: '',
    ammonia_nitrogen: '',
    total_phosphorus: '',
    total_nitrogen: '',
    chlorophyll_a: '',
    algae_density: '',
    site_status: ''
  });
  const [page, setPage] = useState(0);  // 当前页码
  const [rowsPerPage, setRowsPerPage] = useState(20);  // 每页数据条数
  const [totalCount, setTotalCount] = useState(0);  // 数据总条数
  const [editing, setEditing] = useState(false); // 控制编辑弹窗
  const [currentId, setCurrentId] = useState<number | null>(null); // 当前编辑的id

  useEffect(() => {
    fetchWaterQualityData();
  }, [page, rowsPerPage]);  // 依赖项是页码和每页条数，发生变化时重新获取数据

  const fetchWaterQualityData = async () => {
    const result = await getWaterQualityData(page + 1, rowsPerPage);  // 页码从1开始
    setData(result.data);  // 获取数据列表
    setTotalCount(result.totalCount);  // 获取数据总条数
  };

  const handleAddData = async () => {
    if (Object.values(newWaterQuality).some(value => !value)) {
      alert("请填写所有字段！");
      return;
    }

    await addWaterQualityData(newWaterQuality);
    fetchWaterQualityData();
    setNewWaterQuality({
      province: '',
      river_basin: '',
      section_name: '',
      monitoring_time: '',
      water_quality_category: '',
      temperature: '',
      ph: '',
      dissolved_oxygen: '',
      conductivity: '',
      turbidity: '',
      permanganate_index: '',
      ammonia_nitrogen: '',
      total_phosphorus: '',
      total_nitrogen: '',
      chlorophyll_a: '',
      algae_density: '',
      site_status: ''
    });
  };

  const handleDeleteData = async (id: number) => {
    await deleteWaterQualityData(id);
    fetchWaterQualityData();
  };

  const handleEditData = (item: any) => {
    setEditing(true);
    setCurrentId(item.id);
    setNewWaterQuality({ ...item });
  };

  const handleUpdateData = async () => {
    if (Object.values(newWaterQuality).some(value => !value)) {
      alert("请填写所有字段！");
      return;
    }

    await updateWaterQualityData(currentId as number, newWaterQuality);
    fetchWaterQualityData();
    setEditing(false);
    setNewWaterQuality({
      province: '',
      river_basin: '',
      section_name: '',
      monitoring_time: '',
      water_quality_category: '',
      temperature: '',
      ph: '',
      dissolved_oxygen: '',
      conductivity: '',
      turbidity: '',
      permanganate_index: '',
      ammonia_nitrogen: '',
      total_phosphorus: '',
      total_nitrogen: '',
      chlorophyll_a: '',
      algae_density: '',
      site_status: ''
    });
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    setPage(newPage);  // 更新页码
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  // 每次修改每页条数时都重置到第一页
  };

  return (
    <Box>
      {/* 添加/编辑框 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.keys(newWaterQuality).map((key, index) => (
          <Grid  size={{ xs: 3, md: 4 }}>
            <TextField
              label={key}
              value={newWaterQuality[key]}
              onChange={(e) => setNewWaterQuality({ ...newWaterQuality, [key]: e.target.value })}
              variant="outlined"
              fullWidth
            />
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" color="primary" onClick={editing ? handleUpdateData : handleAddData}>
        {editing ? '更新水质数据' : '添加水质数据'}
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>省份</TableCell>
              <TableCell>河流流域</TableCell>
              <TableCell>监测点</TableCell>
              <TableCell>监测时间</TableCell>
              <TableCell>水质类别</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.province}</TableCell>
                <TableCell>{item.river_basin}</TableCell>
                <TableCell>{item.section_name}</TableCell>
                <TableCell>{item.monitoring_time}</TableCell>
                <TableCell>{item.water_quality_category}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditData(item)}>编辑</Button>
                  <Button onClick={() => handleDeleteData(item.id)} color="error">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页功能 */}
      <TablePagination
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
};

export default WaterQualityManagement;
