CREATE TABLE `chat_entries` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_requires` (
	`master_id` text NOT NULL,
	`require_id` text NOT NULL,
	`version` text NOT NULL,
	PRIMARY KEY(`master_id`, `require_id`),
	FOREIGN KEY (`master_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`require_id`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `preset_entries` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `preset_requires` (
	`master_id` text NOT NULL,
	`require_id` text NOT NULL,
	`version` text NOT NULL,
	PRIMARY KEY(`master_id`, `require_id`),
	FOREIGN KEY (`master_id`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`require_id`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `presets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`version` text NOT NULL,
	`tags` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
