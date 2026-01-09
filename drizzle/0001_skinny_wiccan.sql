CREATE TABLE `leads` (
	`id` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`fullName` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`state` enum('PA','UT','Other') NOT NULL,
	`interest` enum('WEIGHT_LOSS','MENOPAUSE_HRT','GENERAL','OTHER') NOT NULL,
	`preferredContactMethod` enum('PHONE','EMAIL','TEXT') NOT NULL,
	`preferredContactTime` text,
	`status` enum('NEW','CONTACTED','SCHEDULED','CLOSED') NOT NULL DEFAULT 'NEW',
	`internalNotes` text,
	`source` varchar(100) NOT NULL DEFAULT 'website_contact_form',
	`message` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `leads_createdAt_idx` ON `leads` (`createdAt`);--> statement-breakpoint
CREATE INDEX `leads_email_idx` ON `leads` (`email`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);