CREATE TABLE `biteFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biteId` varchar(10) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`content` text,
	`fileType` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `biteFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biteMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biteId` varchar(10) NOT NULL,
	`version` varchar(20) DEFAULT '1.0.0',
	`lastCommit` text,
	`dependencies` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `biteMetadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `biteMetadata_biteId_unique` UNIQUE(`biteId`)
);
--> statement-breakpoint
CREATE TABLE `bitePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biteId` varchar(10) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','developer','viewer') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bitePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biteVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biteId` varchar(10) NOT NULL,
	`versionNumber` int NOT NULL,
	`message` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biteVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biteId` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`tags` text,
	`downloads` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`isPublic` int DEFAULT 1,
	`framework` varchar(50) DEFAULT 'vanilla',
	CONSTRAINT `bites_id` PRIMARY KEY(`id`),
	CONSTRAINT `bites_biteId_unique` UNIQUE(`biteId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;