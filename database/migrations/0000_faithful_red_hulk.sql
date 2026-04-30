CREATE TABLE `chat_entries` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`requires` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `preset_entries` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `db`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `db` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`requires` text DEFAULT '[]',
	`code` text NOT NULL,
	`version` text NOT NULL,
	`tags` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `db_code_unique` ON `db` (`code`);