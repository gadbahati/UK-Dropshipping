CREATE TABLE `activation_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mpesaTransactionCode` varchar(64) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activation_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pickup_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`pickupDate` timestamp,
	`adminNotes` text,
	`approvedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pickup_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackingNumber` varchar(64) NOT NULL,
	`status` enum('pending','in_transit','delivered','returned') NOT NULL DEFAULT 'pending',
	`profit` decimal(10,2) DEFAULT '0',
	`destination` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_trackingNumber_unique` UNIQUE(`trackingNumber`)
);
--> statement-breakpoint
CREATE TABLE `withdrawal_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`mpesaNumber` varchar(20) NOT NULL,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`approvedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `registrationStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `activationStatus` enum('inactive','active','suspended') DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `pickupStatus` enum('pending','approved_for_pickup','pickup_completed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `activationFeePaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `adminNotes` text;