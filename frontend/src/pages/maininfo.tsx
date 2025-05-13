import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Box
} from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../store';


const MainInfo: React.FC = () => {
    return (
      <Typography variant="h4" component="h1" gutterBottom>
        主要信息
      </Typography>
    )
  
}

export default MainInfo;