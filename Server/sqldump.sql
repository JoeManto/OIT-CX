-- MySQL dump 10.13  Distrib 8.0.16, for macos10.14 (x86_64)
--
-- Host: localhost    Database: nodemysql
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `bnid` varchar(255) DEFAULT NULL,
  `win` mediumtext,
  PRIMARY KEY (`id`)
);
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--


INSERT INTO `customer` VALUES (1,'jimmy jones','kjs6381','123456789'),(2,'steve smith','kls3523','123456789');


--
-- Table structure for table `groupRoles`
--

DROP TABLE IF EXISTS `groupRoles`;
CREATE TABLE `groupRoles` (
  `groupID` int(11) DEFAULT NULL,
  `emailList` varchar(255) DEFAULT NULL,
  `groupName` varchar(255) DEFAULT NULL
);

--
-- Dumping data for table `groupRoles`
--

INSERT INTO `groupRoles` VALUES (0,'joe.m.manto@wmich.edu','helpdesk-stu'),(1,'labstestemail','labs-stu'),(2,'calltestemail','call-stu');


--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupID` int(11) DEFAULT NULL,
  `posName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--
-- Dumping data for table `positions`
--


INSERT INTO `positions` VALUES (1,0,'Walk-In'),(2,0,'Mobile'),(3,0,'Call-In'),(4,1,'Labs'),(5,2,'Calls');


--
-- Table structure for table `records`
--

DROP TABLE IF EXISTS `records`;
CREATE TABLE `records` (
  `cosID` int(11) DEFAULT NULL,
  `empyID` int(11) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL
);

--
-- Dumping data for table `records`
--


INSERT INTO `records` VALUES (2,3,'2008-11-11'),(2,4,'2008-10-10'),(1,3,'2008-10-10');


--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `shiftID` int(11) NOT NULL AUTO_INCREMENT,
  `coveredBy` int(11) DEFAULT NULL,
  `postedBy` int(11) DEFAULT NULL,
  `postedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `availability` tinyint(4) DEFAULT NULL,
  `positionID` int(11) DEFAULT NULL,
  `groupID` int(11) DEFAULT NULL,
  `perm` tinyint(4) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `shiftDateEnd` mediumtext,
  `shiftDateStart` mediumtext,
  PRIMARY KEY (`shiftID`)
);

--
-- Dumping data for table `shifts`
--


INSERT INTO `shifts` VALUES (23,3,3,'2019-07-16 11:34:36',1,2,0,0,'','1563328831720','1563317131720'),(24,3,3,'2019-07-16 12:29:27',1,1,0,0,'','1563964218166','1563953418179'),(25,3,3,'2019-07-16 13:14:30',1,2,0,0,'','1563328846222','1563317146222'),(27,NULL,11,'2019-07-16 15:16:59',0,5,2,0,'','1608642038982','1608627639025'),(31,NULL,3,'2019-07-25 15:57:59',0,1,0,0,'','1603438246596','1603436446606');


--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empyname` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` int(11) DEFAULT NULL,
  `empybnid` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `groupRole` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--
-- Dumping data for table `users`
--

INSERT INTO `users` VALUES (3,'admin','adminsurname','123456',1,'jfj5666','joe.m.manto@wmich.edu',0),(9,'test-helpdesk-stu','helpdesk-surname','123456',0,'helpdesk-stu',NULL,0),(10,'test-labs-stu','labs-surname','123456',0,'labs-stu',NULL,1),(11,'test-calls-stu','calls-surname','123456',0,'calls-stu',NULL,2);
