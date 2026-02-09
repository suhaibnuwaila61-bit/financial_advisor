CREATE TABLE `lendings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('lent','borrowed') NOT NULL,
	`personName` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`status` enum('pending','partial','repaid') NOT NULL DEFAULT 'pending',
	`amountRepaid` decimal(12,2) NOT NULL DEFAULT '0',
	`dueDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lendings_id` PRIMARY KEY(`id`)
);
