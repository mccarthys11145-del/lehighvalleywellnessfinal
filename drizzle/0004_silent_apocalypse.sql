CREATE TABLE `patientMessages` (
	`id` varchar(36) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`patientName` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`program` enum('WEIGHT_LOSS','MENOPAUSE_HRT','COMBINED','OTHER') NOT NULL,
	`category` enum('SCHEDULING','BILLING','MEDICATION','SIDE_EFFECTS','LABS','TECHNICAL','OTHER') NOT NULL,
	`message` text NOT NULL,
	`urgency` enum('ROUTINE','SOON','URGENT') NOT NULL DEFAULT 'ROUTINE',
	`conversationContext` text,
	`status` enum('NEW','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'NEW',
	`staffNotes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `patientMessages_createdAt_idx` ON `patientMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `patientMessages_email_idx` ON `patientMessages` (`email`);--> statement-breakpoint
CREATE INDEX `patientMessages_status_idx` ON `patientMessages` (`status`);