-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: suitelifershop-suiteliferojtdev.e.aivencloud.com    Database: dev_SuiteLifer
-- ------------------------------------------------------
-- Server version	8.0.35

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'dcb60f2c-5886-11f0-80ab-862ccfb00498:1-4133';

--
-- Table structure for table `sl_shop_categories`
--

DROP TABLE IF EXISTS `sl_shop_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_shop_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_shop_categories`
--

LOCK TABLES `sl_shop_categories` WRITE;
/*!40000 ALTER TABLE `sl_shop_categories` DISABLE KEYS */;
INSERT INTO `sl_shop_categories` VALUES (51,'SWAGS',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(52,'VOUCHERS',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(53,'TRAVEL',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(54,'TECH',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(55,'FOOD',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(56,'WELLNESS',1,'2025-07-09 02:10:19','2025-07-09 02:10:19'),(57,'BEAUTY',1,'2025-07-09 05:35:43','2025-07-09 05:35:43'),(58,'ENTERTAINMENT',1,'2025-07-10 07:33:28','2025-07-10 07:33:28');
/*!40000 ALTER TABLE `sl_shop_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_products`
--

DROP TABLE IF EXISTS `sl_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `price_points` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `unique_product_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_active` (`is_active`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `sl_shop_categories` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sl_products_category_id` FOREIGN KEY (`category_id`) REFERENCES `sl_shop_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_products`
--

LOCK TABLES `sl_products` WRITE;
/*!40000 ALTER TABLE `sl_products` DISABLE KEYS */;
INSERT INTO `sl_products` VALUES (15,'FS Premium Mug','fs-premium-mug','High-quality ceramic coffee mug with company branding. Perfect for your morning brew with excellent heat retention.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108974/suitelifer/placeholders/swags_placeholder.webp',250,1,51,'2025-07-09 02:10:19','2025-07-11 15:41:33'),(16,'FS Polo Shirt','fs-polo-shirt','Professional polo shirt with company branding. Made from breathable fabric perfect for business casual attire.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108974/suitelifer/placeholders/swags_placeholder.webp',800,0,51,'2025-07-09 02:10:19','2025-07-11 08:56:23'),(17,'FS Tee (Black/White)','fs-tee-blackwhite','Comfortable cotton t-shirt available in black and white colors. Features company logo.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108974/suitelifer/placeholders/swags_placeholder.webp',500,1,51,'2025-07-09 02:10:19','2025-07-11 06:07:57'),(20,'Starbucks eGift ₱500','starbucks-egift-500','Digital gift card worth 500 pesos for Starbucks. Enjoy your favorite coffee and treats.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',1000,1,52,'2025-07-09 02:10:20','2025-07-11 06:07:57'),(21,'Lazada Voucher ₱500','lazada-voucher-500','Shopping voucher worth 500 pesos for Lazada. Shop for your favorite products online.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',1000,1,52,'2025-07-09 02:10:20','2025-07-11 06:07:57'),(22,'Tauceti Voucher ₱500','tauceti-voucher-500','Gift voucher worth 500 pesos for Tauceti. Perfect for treating yourself.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',750,1,52,'2025-07-09 02:10:20','2025-07-11 06:07:57'),(23,'Food Panda Voucher ₱300','food-panda-voucher-300','Food delivery voucher worth 300 pesos. Order your favorite meals.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',600,1,55,'2025-07-09 02:10:20','2025-07-14 13:20:01'),(24,'Jollibee Voucher ₱250','jollibee-voucher-250','Fast food voucher worth 250 pesos for Jollibee.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',500,1,55,'2025-07-09 02:10:20','2025-07-11 06:07:58'),(25,'Gym/Yoga Voucher ₱500','gymyoga-voucher-500','Fitness voucher worth 500 pesos for gym or yoga classes. Stay healthy and active.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108986/suitelifer/placeholders/wellness_placeholder.webp',1000,1,56,'2025-07-09 02:10:20','2025-07-11 06:07:58'),(26,'Spa Voucher ₱800','spa-voucher-800','Relaxing spa voucher worth 800 pesos. Perfect for stress relief.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108986/suitelifer/placeholders/wellness_placeholder.webp',1600,1,56,'2025-07-09 02:10:20','2025-07-11 06:07:58'),(27,'Airfare Ticket ₱2000','airfare-ticket-2000','Airfare ticket worth 2000 pesos for domestic flights. Perfect for business trips.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108979/suitelifer/placeholders/travel_placeholder.webp',4000,1,53,'2025-07-09 02:10:20','2025-07-11 06:07:58'),(28,'Bus Ticket ₱500','bus-ticket-500','Bus ticket worth 500 pesos for intercity travel. Convenient transportation.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108979/suitelifer/placeholders/travel_placeholder.webp',1000,1,53,'2025-07-09 02:10:20','2025-07-11 06:07:58'),(29,'Grab Voucher ₱300','grab-voucher-300','Ride voucher worth 300 pesos for Grab transportation.','https://res.cloudinary.com/dpmkqknh2/image/upload/v1752108976/suitelifer/placeholders/vouchers_placeholder.webp',600,1,53,'2025-07-09 02:10:20','2025-07-11 06:07:58');
/*!40000 ALTER TABLE `sl_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_variation_types`
--

DROP TABLE IF EXISTS `sl_variation_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_variation_types` (
  `variation_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `type_label` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_variation_types`
--

LOCK TABLES `sl_variation_types` WRITE;
/*!40000 ALTER TABLE `sl_variation_types` DISABLE KEYS */;
INSERT INTO `sl_variation_types` VALUES (1,'size','Size',1,1,'2025-07-10 03:19:51','2025-07-10 03:19:51'),(2,'color','Color',1,2,'2025-07-10 03:19:51','2025-07-10 03:19:51'),(3,'style','Style',1,3,'2025-07-10 03:19:51','2025-07-10 03:19:51'),(4,'material','Material',1,4,'2025-07-10 03:19:51','2025-07-10 03:19:51'),(5,'capacity','Capacity',1,5,'2025-07-10 03:19:51','2025-07-10 03:19:51'),(11,'design','Design',1,3,'2025-07-11 06:17:59','2025-07-11 06:17:59');
/*!40000 ALTER TABLE `sl_variation_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_variation_options`
--

DROP TABLE IF EXISTS `sl_variation_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_variation_options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `variation_type_id` int NOT NULL,
  `option_value` varchar(100) NOT NULL,
  `option_label` varchar(100) NOT NULL,
  `hex_color` varchar(7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`option_id`),
  UNIQUE KEY `unique_type_value` (`variation_type_id`,`option_value`),
  CONSTRAINT `fk_option_variation_type` FOREIGN KEY (`variation_type_id`) REFERENCES `sl_variation_types` (`variation_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_variation_options`
--

LOCK TABLES `sl_variation_options` WRITE;
/*!40000 ALTER TABLE `sl_variation_options` DISABLE KEYS */;
INSERT INTO `sl_variation_options` VALUES (1,1,'xs','Extra Small',NULL,1,1,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(2,1,'s','Small',NULL,1,2,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(3,1,'m','Medium',NULL,1,3,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(4,1,'l','Large',NULL,1,4,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(5,1,'xl','Extra Large',NULL,1,5,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(6,1,'xxl','2X Large',NULL,1,6,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(8,2,'red','Red','#DC2626',1,1,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(9,2,'blue','Blue','#2563EB',1,2,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(10,2,'green','Green','#16A34A',1,3,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(11,2,'black','Black','#000000',1,4,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(12,2,'white','White','#FFFFFF',1,5,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(13,2,'gray','Gray','#6B7280',1,6,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(14,2,'navy','Navy Blue','#1E3A8A',1,7,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(15,3,'classic','Classic',NULL,1,1,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(16,3,'modern','Modern',NULL,1,2,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(17,3,'vintage','Vintage',NULL,1,3,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(18,3,'premium','Premium',NULL,1,4,'2025-07-10 03:19:52','2025-07-10 03:19:52'),(25,2,'brown','Brown','#8B4513',1,3,'2025-07-11 06:17:59','2025-07-11 06:17:59'),(26,11,'fs-design','FS Design Mug',NULL,1,1,'2025-07-11 06:18:00','2025-07-11 06:18:00'),(27,11,'cat-design','Cat Design Mug',NULL,1,2,'2025-07-11 06:18:00','2025-07-11 06:18:00');
/*!40000 ALTER TABLE `sl_variation_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_product_variations`
--

DROP TABLE IF EXISTS `sl_product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_product_variations` (
  `variation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variation_sku` varchar(100) DEFAULT NULL,
  `price_adjustment` int DEFAULT '0',
  `stock_quantity` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `weight` decimal(10,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variation_id`),
  UNIQUE KEY `variation_sku` (`variation_sku`),
  KEY `fk_variation_product` (`product_id`),
  CONSTRAINT `fk_variation_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_stock_non_negative` CHECK ((`stock_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_product_variations`
--

LOCK TABLES `sl_product_variations` WRITE;
/*!40000 ALTER TABLE `sl_product_variations` DISABLE KEYS */;
INSERT INTO `sl_product_variations` VALUES (3,16,'Size',0,0,1,NULL,NULL,'2025-07-10 07:34:18','2025-07-10 07:34:18');
/*!40000 ALTER TABLE `sl_product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_product_variation_options`
--

DROP TABLE IF EXISTS `sl_product_variation_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_product_variation_options` (
  `variation_option_id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int NOT NULL,
  `option_id` int NOT NULL,
  PRIMARY KEY (`variation_option_id`),
  UNIQUE KEY `unique_variation_option` (`variation_id`,`option_id`),
  KEY `fk_variation_option_option` (`option_id`),
  CONSTRAINT `fk_variation_option_option` FOREIGN KEY (`option_id`) REFERENCES `sl_variation_options` (`option_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_variation_option_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_product_variation_options`
--

LOCK TABLES `sl_product_variation_options` WRITE;
/*!40000 ALTER TABLE `sl_product_variation_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `sl_product_variation_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_carts`
--

DROP TABLE IF EXISTS `sl_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sl_carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_carts`
--

LOCK TABLES `sl_carts` WRITE;
/*!40000 ALTER TABLE `sl_carts` DISABLE KEYS */;
INSERT INTO `sl_carts` VALUES (1,'0af0757c-fa51-11ef-a725-0af0d960a833','2025-07-09 13:25:29'),(2,'019614eb-5acf-700e-a7f3-295b59219714','2025-07-09 13:30:22'),(3,'0197e242-5b2d-77a1-a8a8-d3311c3bfde7','2025-07-09 16:39:46'),(5,'019614eb-5acf-700e-a7f3-295b59219714','2025-07-09 16:54:21');
/*!40000 ALTER TABLE `sl_carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_cart_items`
--

DROP TABLE IF EXISTS `sl_cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `variation_id` int DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `sl_cart_items_variation_id_foreign` (`variation_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `sl_cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `sl_carts` (`cart_id`),
  CONSTRAINT `sl_cart_items_variation_id_foreign` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_cart_items`
--

LOCK TABLES `sl_cart_items` WRITE;
/*!40000 ALTER TABLE `sl_cart_items` DISABLE KEYS */;
INSERT INTO `sl_cart_items` VALUES (13,5,27,2,NULL,'2025-07-10 05:36:34','2025-07-11 00:25:25'),(88,3,28,1,NULL,'2025-07-14 05:28:49','2025-07-14 05:28:49'),(89,3,23,1,NULL,'2025-07-14 05:28:50','2025-07-14 05:28:50'),(90,3,15,1,NULL,'2025-07-14 05:28:51','2025-07-14 05:28:51'),(91,3,29,1,NULL,'2025-07-14 05:28:54','2025-07-14 05:28:54'),(93,3,24,1,NULL,'2025-07-14 05:28:57','2025-07-14 05:28:57'),(94,3,26,1,NULL,'2025-07-14 05:29:00','2025-07-14 05:29:00'),(96,3,22,1,NULL,'2025-07-14 05:29:04','2025-07-14 05:29:04');
/*!40000 ALTER TABLE `sl_cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_orders`
--

DROP TABLE IF EXISTS `sl_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `total_points` int DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`order_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `sl_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sl_user_accounts` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_orders`
--

LOCK TABLES `sl_orders` WRITE;
/*!40000 ALTER TABLE `sl_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `sl_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sl_order_items`
--

DROP TABLE IF EXISTS `sl_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sl_order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `points_spent` int DEFAULT NULL,
  `variation_id` int DEFAULT NULL,
  `variation_details` json DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `price_points` int NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_item_variation` (`variation_id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_item_variation` FOREIGN KEY (`variation_id`) REFERENCES `sl_product_variations` (`variation_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `sl_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`) ON DELETE RESTRICT,
  CONSTRAINT `sl_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `sl_orders` (`order_id`),
  CONSTRAINT `sl_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `sl_products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sl_order_items`
--

LOCK TABLES `sl_order_items` WRITE;
/*!40000 ALTER TABLE `sl_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `sl_order_items` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-14 14:06:27
