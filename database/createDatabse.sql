CREATE DATABASE IF NOT EXISTS noticieros;

USE noticieros;

CREATE TABLE IF NOT EXISTS `ia_settings` (
`id` int NOT NULL,
`channel_name` varchar(100) DEFAULT 'Noticiero',
`male_presenter` varchar(100) DEFAULT 'Javier',
`female_presenter` varchar(100) DEFAULT 'Lucia',
`censored_words` json DEFAULT NULL,
PRIMARY KEY (`id`)
);


CREATE TABLE IF NOT EXISTS `noticieros` (
`id` varchar(36) NOT NULL DEFAULT (uuid()),
`title` varchar(255) NOT NULL,
`guion` text NOT NULL,
`state` enum('PENDING','PUBLISHED','REJECTED') NOT NULL,
`publicationDate` datetime NOT NULL,
PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `rss_channels` (
`id` varchar(36) NOT NULL,
`name` varchar(255) NOT NULL,
`url` varchar(255) NOT NULL,
`isActive` tinyint(1) NOT NULL DEFAULT '1',
PRIMARY KEY (`id`),
UNIQUE KEY `url` (`url`)
);

CREATE TABLE IF NOT EXISTS `usuarios` (
 `username` varchar(100) NOT NULL,
 `password` text NOT NULL,
 `role` enum('admin','user') NOT NULL DEFAULT 'user',
PRIMARY KEY (`username`)
);