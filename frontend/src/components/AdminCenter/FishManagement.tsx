import React, { useState, useEffect } from "react";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Grid, useTheme, useMediaQuery, Typography, Stack, Paper } from "@mui/material";
import { getFishData, addFishData, deleteFishData, updateFishData } from "../../services/fishService";

const FishManagement: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [newFishData, setNewFishData] = useState<any>({
    species: '',
    weight: '',
    length1: '',
    length2: '',
    length3: '',
    height: '',
    width: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchFishData();
  }, [page, rowsPerPage]);

  const fetchFishData = async () => {
    const result = await getFishData(page + 1, rowsPerPage);
    setData(result.data);
    setTotalCount(result.totalCount);
  };

  const handleAddData = async () => {
    if (Object.values(newFishData).some(value => !value)) {
      alert("请填写所有字段！");
      return;
    }

    await addFishData(newFishData);
    fetchFishData();
    setNewFishData({
      species: '',
      weight: '',
      length1: '',
      length2: '',
      length3: '',
      height: '',
      width: ''
    });
  };

  const handleDeleteData = async (id: number) => {
    await deleteFishData(id);
    fetchFishData();
  };

  const handleEditData = (item: any) => {
    setEditing(true);
    setCurrentId(item.id);
    setNewFishData({ ...item });
  };

  const handleUpdateData = async () => {
    if (Object.values(newFishData).some(value => !value)) {
      alert("请填写所有字段！");
      return;
    }

    await updateFishData(currentId as number, newFishData);
    fetchFishData();
    setEditing(false);
    setNewFishData({
      species: '',
      weight: '',
      length1: '',
      length2: '',
      length3: '',
      height: '',
      width: ''
    });
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* 添加/编辑表单 */}
      <Typography variant="h6" sx={{ mb: 1 }}>添加/编辑鱼类数据</Typography>
      <Grid container spacing={0.5} sx={{ mb: 1 }}> {/* Adjusted spacing to reduce gap */}
        {Object.keys(newFishData).map((key, index) => (
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={key}
              value={newFishData[key]}
              onChange={(e) => setNewFishData({ ...newFishData, [key]: e.target.value })}
              variant="outlined"
              fullWidth
              size="small"
              sx={{ maxWidth: '120px', minWidth: '80px', marginBottom: 1 }}  
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={editing ? handleUpdateData : handleAddData}
          sx={{ width: isMobile ? '100%' : '150px' }}  // Adjusted button width
        >
          {editing ? '更新鱼类数据' : '添加鱼类数据'}
        </Button>
      </Box>

      {/* 鱼类数据表格 */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto', mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>物种</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>重量</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>长度1</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>长度2</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>长度3</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>高度</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>宽度</TableCell>
              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.species}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.weight}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.length1}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.length2}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.length3}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.height}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{item.width}</TableCell>
                <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={0.5} justifyContent="flex-end">
                    <Button onClick={() => handleEditData(item)} variant="outlined" size="small">
                      编辑
                    </Button>
                    <Button onClick={() => handleDeleteData(item.id)} color="error" variant="outlined" size="small">
                      删除
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      <TablePagination
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default FishManagement;
