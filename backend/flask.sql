/*
 Navicat MySQL Data Transfer

 Source Server         : flask
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : localhost:3306
 Source Schema         : flask

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 14/05/2025 15:06:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '111', 'scrypt:32768:8:1$qt8eq5xH1AZEGp3a$a3fe1a4db7b0e0c0bd55179a7a12cb31276e0d92cf1d0cc34053ac5231ab096eba0fa266f522247ca6d81dbeb59da1f39c6555a3a2fe05e4673ef0fcd613841f', 'admin');
INSERT INTO `user` VALUES (2, '222', 'scrypt:32768:8:1$JEJVWGCaapvfx1ne$76ad98f35184ad4fe5674f6f567b99d7bd06c999ddf9c5a13e9f1b1946d9c50ff01f3eba2149eabfad14cd5eda733dba29ef377de62236776e65279fc5d91e9c', 'admin');

SET FOREIGN_KEY_CHECKS = 1;
