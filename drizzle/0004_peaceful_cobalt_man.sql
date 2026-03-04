CREATE TABLE `investment_dividends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`dividendAmount` decimal(12,2) NOT NULL,
	`dividendDate` datetime NOT NULL,
	`dividendYield` decimal(8,4),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investment_dividends_id` PRIMARY KEY(`id`)
);
