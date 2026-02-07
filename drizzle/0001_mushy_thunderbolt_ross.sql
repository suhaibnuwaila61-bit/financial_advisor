CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`name` varchar(255) NOT NULL,
	`limitAmount` decimal(12,2) NOT NULL,
	`period` enum('daily','weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
	`spent` decimal(12,2) NOT NULL DEFAULT '0',
	`startDate` datetime NOT NULL,
	`endDate` datetime,
	`alertThreshold` int NOT NULL DEFAULT 80,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('expense','income') NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#FF1493',
	`icon` varchar(50) NOT NULL DEFAULT 'tag',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialInsights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightType` enum('spending_pattern','investment_recommendation','savings_tip','budget_analysis') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financialInsights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto','commodity','etf','mutual_fund','other') NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`purchasePrice` decimal(12,2) NOT NULL,
	`currentPrice` decimal(12,2) NOT NULL,
	`purchaseDate` datetime NOT NULL,
	`name` varchar(255) NOT NULL,
	`notes` text,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','crypto') NOT NULL,
	`currentPrice` decimal(12,2) NOT NULL,
	`priceChange` decimal(10,2),
	`priceChangePercent` decimal(8,4),
	`marketCap` decimal(18,0),
	`volume` decimal(18,0),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketData_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketData_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('budget_alert','goal_achieved','portfolio_change','market_alert','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savingsGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetAmount` decimal(12,2) NOT NULL,
	`currentAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`deadline` datetime,
	`category` varchar(100),
	`description` text,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savingsGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`type` enum('expense','income') NOT NULL,
	`description` text,
	`transactionDate` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
