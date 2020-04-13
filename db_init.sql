-- Adminer 4.7.5 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL,
  bnid varchar(255) DEFAULT NULL,
  win mediumtext,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS groupRoles;
CREATE TABLE groupRoles (
  groupID int(11) DEFAULT NULL,
  emailList varchar(255) DEFAULT NULL,
  groupName varchar(255) DEFAULT NULL,
  locked int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS legacyRecords;
CREATE TABLE legacyRecords (
  cosID int(11) DEFAULT NULL,
  empyID int(11) DEFAULT NULL,
  location int(11) DEFAULT NULL,
  date timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS legacyShifts;
CREATE TABLE legacyShifts (
  shiftID int(11) NOT NULL,
  coveredBy int(11) DEFAULT NULL,
  postedBy int(11) DEFAULT NULL,
  postedDate datetime DEFAULT CURRENT_TIMESTAMP,
  availability tinyint(4) DEFAULT NULL,
  positionID int(11) DEFAULT NULL,
  groupID int(11) DEFAULT NULL,
  perm tinyint(4) DEFAULT NULL,
  message varchar(255) DEFAULT NULL,
  shiftDateEnd mediumtext,
  shiftDateStart mediumtext,
  PRIMARY KEY (shiftID)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS location;
CREATE TABLE location (
  id int(11) NOT NULL,
  locationName varchar(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS positions;
CREATE TABLE positions (
  id int(11) NOT NULL AUTO_INCREMENT,
  groupID int(11) DEFAULT NULL,
  posName varchar(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS records;
CREATE TABLE records (
  cosID int(11) DEFAULT NULL,
  empyID int(11) DEFAULT NULL,
  location int(11) DEFAULT NULL,
  date timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS shifts;
CREATE TABLE shifts (
  shiftID int(11) NOT NULL AUTO_INCREMENT,
  coveredBy int(11) DEFAULT NULL,
  postedBy int(11) DEFAULT NULL,
  postedDate datetime DEFAULT CURRENT_TIMESTAMP,
  availability tinyint(4) DEFAULT NULL,
  positionID int(11) DEFAULT NULL,
  groupID int(11) DEFAULT NULL,
  perm tinyint(4) DEFAULT NULL,
  message varchar(255) DEFAULT NULL,
  shiftDateEnd mediumtext,
  shiftDateStart mediumtext,
  PRIMARY KEY (shiftID)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id int(11) NOT NULL AUTO_INCREMENT,
  empyname varchar(255) DEFAULT NULL,
  surname varchar(255) DEFAULT NULL,
  password varchar(255) DEFAULT NULL,
  role int(11) DEFAULT NULL,
  empybnid varchar(255) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  groupRole int(11) DEFAULT NULL,
  locked int(11) DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2020-03-04 15:47:51