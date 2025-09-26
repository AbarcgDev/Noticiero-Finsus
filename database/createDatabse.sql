CREATE DATABASE noticieros;

USE noticieros;

CREATE TABLE `ia_settings` (
  `id` int NOT NULL,
  `channel_name` varchar(100) DEFAULT 'Noticiero',
  `male_presenter` varchar(100) DEFAULT 'Javier',
  `female_presenter` varchar(100) DEFAULT 'Lucia',
  `censored_words` json DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `noticieros` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `guion` text NOT NULL,
  `state` enum('PENDING','PUBLISHED','REJECTED') NOT NULL,
  `publicationDate` datetime NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `rss-channels` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`)
);

CREATE TABLE `usuarios` (
  `username` varchar(100) NOT NULL,
  `password` text NOT NULL,
  PRIMARY KEY (`username`)
);