-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: quanlykhachsan
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `admin_name` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` int NOT NULL,
  `reason` text,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
INSERT INTO `admin_logs` VALUES (1,1,'TyTi','UPDATE','booking',1,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #1 - Khách: Tiến Vĩnh Nguyễn - Phòng: 101','2025-11-09 06:48:47'),(2,1,'TyTi','UPDATE','booking',3,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #3 - Khách: Tiến Vĩnh Nguyễn - Phòng: 102','2025-11-09 15:38:42'),(3,1,'TyTi','UPDATE','booking',3,'Cập nhật trạng thái đặt phòng','nhận phòng đặt phòng #3 - Khách: Tiến Vĩnh Nguyễn - Phòng: 102','2025-11-09 15:39:35'),(4,1,'TyTi','UPDATE','booking',3,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #3 - Khách: Tiến Vĩnh Nguyễn - Phòng: 102','2025-11-09 15:43:10'),(5,1,'TyTi','UPDATE','booking',4,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #4 - Khách: Tiến Vĩnh Nguyễn - Phòng: 102','2025-11-10 11:37:07'),(6,1,'TyTi','UPDATE','booking',6,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #6 - Khách: Tiến Vĩnh Nguyễn - Phòng: 103','2025-11-10 11:47:11'),(7,1,'TyTi','UPDATE','booking',6,'Cập nhật trạng thái đặt phòng','nhận phòng đặt phòng #6 - Khách: Tiến Vĩnh Nguyễn - Phòng: 103','2025-11-10 11:47:23'),(8,1,'TyTi','UPDATE','booking',6,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #6 - Khách: Tiến Vĩnh Nguyễn - Phòng: 103','2025-11-10 11:47:32'),(9,1,'TyTi','UPDATE','booking',8,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #8 - Khách: Tiến Vĩnh Nguyễn - Phòng: 201','2025-11-13 06:22:50'),(10,1,'TyTi','UPDATE','booking',8,'Cập nhật trạng thái đặt phòng','nhận phòng đặt phòng #8 - Khách: Tiến Vĩnh Nguyễn - Phòng: 201','2025-11-13 06:23:15'),(11,1,'TyTi','UPDATE','booking',8,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #8 - Khách: Tiến Vĩnh Nguyễn - Phòng: 201','2025-11-13 06:23:23'),(12,1,'TyTi ','UPDATE','booking',7,'Cập nhật trạng thái đặt phòng','hủy đặt phòng #7 - Khách: Tiến Vĩnh Nguyễn - Phòng: 103','2025-11-13 09:28:10'),(13,1,'TyTi ','UPDATE','booking',7,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #7 - Khách: Tiến Vĩnh Nguyễn - Phòng: 103','2025-11-13 09:28:25'),(14,1,'TyTi ','UPDATE','booking',5,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #5 - Khách: Tiến Vĩnh Nguyễn - Phòng: 104','2025-11-13 09:28:30'),(15,1,'TyTi ','UPDATE','booking',4,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #4 - Khách: Tiến Vĩnh Nguyễn - Phòng: 102','2025-11-13 09:28:33'),(16,1,'TyTi ','UPDATE','booking',1,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #1 - Khách: Tiến Vĩnh Nguyễn - Phòng: 101','2025-11-13 09:28:36'),(17,1,'TyTi ','UPDATE','booking',9,'Cập nhật trạng thái đặt phòng','trả phòng đặt phòng #9 - Khách: Tiến Vĩnh Nguyễn - Phòng: 101','2025-11-14 15:08:39'),(18,1,'TyTi','UPDATE','booking',10,'Cập nhật trạng thái đặt phòng','xác nhận đặt phòng #10 - Khách: Tiến Vĩnh Nguyễn - Phòng: 101','2025-11-15 15:16:23'),(19,1,'TyTi','UPDATE','booking',10,'Cập nhật trạng thái đặt phòng','pending đặt phòng #10 - Khách: Tiến Vĩnh Nguyễn - Phòng: 101','2025-11-15 15:16:25');
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `room_id` int NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `room_name` varchar(100) DEFAULT NULL,
  `room_type` varchar(50) DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `guest_count` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) DEFAULT 'cash',
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'Tiến Vĩnh Nguyễn','','nguyenvinhtien641@gmail.com',1,'101','Phòng Hoa Sen','Đơn','2025-11-09','2025-11-12',1,1500000.00,'cash','checked_out','2025-11-09 04:13:37'),(2,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com',1,'101','Phòng Hoa Sen','Đơn','2025-11-09','2025-11-11',1,1000.00,'cash','checked_out','2025-11-09 05:27:47'),(3,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com',2,'102','Phòng Hoa Đào','Đơn','2025-11-10','2025-11-13',1,1500.00,'cash','checked_out','2025-11-09 15:31:31'),(4,'Tiến Vĩnh Nguyễn','0000','',2,'102','Phòng Hoa Đào','Đơn','2025-11-11','2025-11-14',1,1500.00,'cash','checked_out','2025-11-10 11:35:58'),(5,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com',4,'104','Phòng Hoa Cúc','Đơn','2025-11-11','2025-11-15',1,2000.00,'cash','checked_out','2025-11-10 11:39:56'),(6,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com',3,'103','Phòng Hoa Mai','Đơn','2025-11-11','2025-11-13',1,1000.00,'cash','checked_out','2025-11-10 11:44:30'),(7,'Tiến Vĩnh Nguyễn','','nguyenvinhtien641@gmail.com',3,'103','Phòng Hoa Mai','Đơn','2025-11-13','2025-11-15',1,1000.00,'cash','checked_out','2025-11-12 06:40:54'),(8,'Tiến Vĩnh Nguyễn','','nguyenvinhtien641@gmail.com',6,'201','Phòng Biển Xanh','Đôi','2025-11-14','2025-11-16',1,1600.00,'cash','checked_out','2025-11-13 06:21:41'),(9,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com',1,'101','Phòng Hoa Sen','Đơn','2025-11-15','2025-11-17',1,701000.00,'cash','checked_out','2025-11-14 15:07:50'),(10,'Tiến Vĩnh Nguyễn','','nguyenvinhtien641@gmail.com',1,'101','Phòng Hoa Sen','Đơn','2025-11-16','2025-11-18',1,1000.00,'cash','pending','2025-11-15 12:34:19');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `id_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Tiến Vĩnh Nguyễn','','nguyenvinhtien641@gmail.com','','','2025-11-09 04:13:37'),(2,'Tiến Vĩnh Nguyễn','0000','nguyenvinhtien641@gmail.com','','','2025-11-09 05:27:47');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `room_name` varchar(100) DEFAULT NULL,
  `room_rating` int NOT NULL,
  `service_rating` int NOT NULL,
  `comment` text,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `feedback_chk_1` CHECK (((`room_rating` >= 1) and (`room_rating` <= 5))),
  CONSTRAINT `feedback_chk_2` CHECK (((`service_rating` >= 1) and (`service_rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,2,'Tiến Vĩnh Nguyễn','101','Phòng Hoa Sen',5,5,'rất tuyệt ','2025-11-09','2025-11-11','2025-11-09 05:47:23'),(2,3,'Tiến Vĩnh Nguyễn','102','Phòng Hoa Đào',5,5,'sdasdasdasd','2025-11-10','2025-11-13','2025-11-11 07:47:10'),(3,3,'Tiến Vĩnh Nguyễn','102','Phòng Hoa Đào',5,4,'rất ok','2025-11-10','2025-11-13','2025-11-11 07:54:23'),(4,6,'Tiến Vĩnh Nguyễn','103','Phòng Hoa Mai',1,1,'tệ','2025-11-11','2025-11-13','2025-11-11 08:16:30');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_services`
--

DROP TABLE IF EXISTS `invoice_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `service_id` int NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `invoice_services_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  CONSTRAINT `invoice_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_services`
--

LOCK TABLES `invoice_services` WRITE;
/*!40000 ALTER TABLE `invoice_services` DISABLE KEYS */;
INSERT INTO `invoice_services` VALUES (1,10,6,'XÔNG HƠI ',1,500000.00,500000.00),(2,10,5,'tập gym ',1,200000.00,200000.00);
/*!40000 ALTER TABLE `invoice_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `room_charges` decimal(10,2) NOT NULL,
  `service_charges` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,3,'Tiến Vĩnh Nguyễn',1500.00,0.00,1500.00,'paid','2025-11-09 15:43:10'),(3,3,'Tiến ',500.00,0.00,500.00,'pending','2025-11-09 15:46:06'),(4,6,'Tiến Vĩnh Nguyễn',1000.00,0.00,1000.00,'paid','2025-11-10 11:47:32'),(5,8,'Tiến Vĩnh Nguyễn',1600.00,0.00,1600.00,'paid','2025-11-13 06:23:23'),(6,7,'Tiến Vĩnh Nguyễn',1000.00,0.00,1000.00,'paid','2025-11-13 09:28:25'),(7,5,'Tiến Vĩnh Nguyễn',2000.00,0.00,2000.00,'paid','2025-11-13 09:28:30'),(8,4,'Tiến Vĩnh Nguyễn',1500.00,0.00,1500.00,'paid','2025-11-13 09:28:33'),(9,1,'Tiến Vĩnh Nguyễn',1500000.00,0.00,1500000.00,'paid','2025-11-13 09:28:36'),(10,9,'Tiến Vĩnh Nguyễn',1000.00,700000.00,701000.00,'pending','2025-11-14 15:07:50'),(11,9,'Tiến Vĩnh Nguyễn',701000.00,0.00,701000.00,'paid','2025-11-14 15:08:39');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `booking_id` int DEFAULT NULL,
  `feedback_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `for_customers` tinyint(1) DEFAULT '0',
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 102 - Phòng Hoa Đào',4,NULL,NULL,0,0,'2025-11-10 11:35:58'),(2,'booking_update','Cập nhật đặt phòng','Đặt phòng #4 của bạn đã được xác nhận',NULL,NULL,NULL,1,0,'2025-11-10 11:37:07'),(3,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 104 - Phòng Hoa Cúc',5,NULL,NULL,0,0,'2025-11-10 11:39:56'),(4,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 103 - Phòng Hoa Mai',6,NULL,NULL,0,0,'2025-11-10 11:44:30'),(5,'booking_update','Cập nhật đặt phòng','Đặt phòng #6 của bạn đã được xác nhận',NULL,NULL,NULL,1,0,'2025-11-10 11:47:11'),(6,'booking_update','Cập nhật đặt phòng','Bạn đã nhận phòng 103 thành công',NULL,NULL,NULL,1,0,'2025-11-10 11:47:23'),(7,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 103 thành công',NULL,NULL,NULL,1,0,'2025-11-10 11:47:32'),(8,'new_feedback','Đánh giá mới','Khách hàng Tiến Vĩnh Nguyễn đã đánh giá phòng 102',NULL,3,NULL,0,0,'2025-11-11 07:47:10'),(9,'new_feedback','Đánh giá mới','Khách hàng Tiến Vĩnh Nguyễn đã đánh giá phòng 102',NULL,3,NULL,0,0,'2025-11-11 07:54:23'),(10,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 103 - Phòng Hoa Mai',7,NULL,NULL,0,0,'2025-11-12 06:40:54'),(11,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 201 - Phòng Biển Xanh',8,NULL,NULL,0,0,'2025-11-13 06:21:41'),(12,'booking_update','Cập nhật đặt phòng','Đặt phòng #8 của bạn đã được xác nhận',NULL,NULL,NULL,1,0,'2025-11-13 06:22:50'),(13,'booking_update','Cập nhật đặt phòng','Bạn đã nhận phòng 201 thành công',NULL,NULL,NULL,1,0,'2025-11-13 06:23:15'),(14,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 201 thành công',NULL,NULL,NULL,1,0,'2025-11-13 06:23:23'),(15,'booking_update','Cập nhật đặt phòng','Đặt phòng #7 của bạn đã bị hủy',NULL,NULL,NULL,1,0,'2025-11-13 09:28:10'),(16,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 103 thành công',NULL,NULL,NULL,1,0,'2025-11-13 09:28:25'),(17,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 104 thành công',NULL,NULL,NULL,1,0,'2025-11-13 09:28:30'),(18,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 102 thành công',NULL,NULL,NULL,1,0,'2025-11-13 09:28:33'),(19,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 101 thành công',NULL,NULL,NULL,1,0,'2025-11-13 09:28:36'),(20,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 101 - Phòng Hoa Sen',9,NULL,NULL,0,0,'2025-11-14 15:07:50'),(21,'booking_update','Cập nhật đặt phòng','Bạn đã trả phòng 101 thành công',NULL,NULL,NULL,1,0,'2025-11-14 15:08:39'),(22,'new_booking','Đặt phòng mới','Khách hàng Tiến Vĩnh Nguyễn đã đặt phòng 101 - Phòng Hoa Sen',10,NULL,NULL,0,0,'2025-11-15 12:34:19'),(23,'booking_update','Cập nhật đặt phòng','Đặt phòng #10 của bạn đã được xác nhận',NULL,NULL,NULL,1,0,'2025-11-15 15:16:23');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `number` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `price` varchar(50) DEFAULT NULL,
  `capacity` int NOT NULL,
  `status` varchar(20) DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'101','Phòng Hoa Sen','Đơn','500.000',1,'available','2025-11-09 05:26:52'),(2,'102','Phòng Hoa Đào','Đơn','500.000',1,'available','2025-11-09 05:26:52'),(3,'103','Phòng Hoa Mai','Đơn','500.000',1,'available','2025-11-09 05:26:52'),(4,'104','Phòng Hoa Cúc','Đơn','500.000',1,'available','2025-11-09 05:26:52'),(5,'105','Phòng Hướng Dương','Đơn','500.000',1,'available','2025-11-09 05:26:52'),(6,'201','Phòng Biển Xanh','Đôi','800.000',2,'available','2025-11-09 05:26:52'),(7,'202','Phòng Biển Bạc','Đôi','800.000',2,'available','2025-11-09 05:26:52'),(8,'203','Phòng Biển Vàng','Đôi','800.000',2,'available','2025-11-09 05:26:52'),(9,'204','Phòng Biển Ngọc','Đôi','800.000',2,'available','2025-11-09 05:26:52'),(10,'205','Phòng Biển Hồng','Đôi','800.000',2,'available','2025-11-09 05:26:52'),(11,'301','Phòng Gia Đình Hạnh Phúc','Gia Đình','1.200.000',4,'available','2025-11-09 05:26:52'),(12,'302','Phòng Gia Đình Yêu Thương','Gia Đình','1.200.000',4,'available','2025-11-09 05:26:52'),(13,'303','Phòng Gia Đình Ấm Ấp','Gia Đình','1.200.000',4,'available','2025-11-09 05:26:52'),(14,'304','Phòng Gia Đình Bình An','Gia Đình','1.200.000',4,'available','2025-11-09 05:26:52'),(15,'305','Phòng Gia Đình Thịnh Vượng','Gia Đình','1.200.000',4,'available','2025-11-09 05:26:52'),(16,'401','Phòng VIP Hoàng Gia','VIP','2.000.000',2,'available','2025-11-09 05:26:52'),(17,'402','Phòng VIP Tổng Thống','VIP','2.000.000',2,'available','2025-11-09 05:26:52'),(18,'403','Phòng VIP Hoàng Hậu','VIP','2.000.000',2,'available','2025-11-09 05:26:52'),(19,'404','Phòng VIP Thiên Đường','VIP','2.000.000',2,'available','2025-11-09 05:26:52'),(20,'405','Phòng VIP Kim Cương','VIP','2.000.000',2,'available','2025-11-09 05:26:52');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (2,'giặt ủi',100000.00,'laundry','','2025-11-09 05:34:35'),(3,'ăn uống ',100000.00,'food','','2025-11-09 06:10:59'),(4,'đưa đón sân bay ',300000.00,'transport','','2025-11-09 06:38:29'),(5,'tập gym ',200000.00,'other','','2025-11-09 15:50:33'),(6,'XÔNG HƠI ',500000.00,'other','','2025-11-14 02:53:55'),(7,'bơi ',50.00,'other','','2025-11-14 16:08:50');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `services_formatted`
--

DROP TABLE IF EXISTS `services_formatted`;
/*!50001 DROP VIEW IF EXISTS `services_formatted`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `services_formatted` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `price_formatted`,
 1 AS `price_raw`,
 1 AS `category`,
 1 AS `description`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Tiến','Nguyễn Vĩnh Tiến ','nguyenvinhtien1112@gmail.com','$2a$10$u2.Rq2vFjwrUTL/HY0BJ6ukEXe1BDk0mWsPs0xFUSa8qraHIFA.Uy','customer','2025-11-08 16:50:11'),(2,'TyTi','Tiến Vĩnh Nguyễn','nguyenvinhtien641@gmail.com','$2a$10$xUYVznVqdbj9FGhJD/ZmMuWN0ed0iTM0XfvnZ5b9VMBqOzR2g.rVu','customer','2025-11-08 16:56:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `services_formatted`
--

/*!50001 DROP VIEW IF EXISTS `services_formatted`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `services_formatted` AS select `services`.`id` AS `id`,`services`.`name` AS `name`,concat(format(`services`.`price`,0),' VND') AS `price_formatted`,`services`.`price` AS `price_raw`,`services`.`category` AS `category`,`services`.`description` AS `description` from `services` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 10:58:02
