CREATE TABLE `investment_price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`recordedAt` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investment_price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`investmentId` int,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto','commodity','etf','mutual_fund','other') NOT NULL,
	`transactionType` enum('buy','sell') NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`pricePerUnit` decimal(12,2) NOT NULL,
	`totalAmount` decimal(18,2) NOT NULL,
	`fees` decimal(12,2) NOT NULL DEFAULT '0',
	`notes` text,
	`transactionDate` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investment_transactions_id` PRIMARY KEY(`id`)
);
