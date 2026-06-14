CREATE TABLE `llmapi_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `llmapi`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `llmapi` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`code` text NOT NULL,
	`provider` text,
	`builder` text,
	`key` text,
	`version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `llmapi_code_unique` ON `llmapi` (`code`);--> statement-breakpoint
CREATE TABLE `preset_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `preset`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `preset` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`code` text NOT NULL,
	`version` text NOT NULL,
	`tags` text NOT NULL,
	`requires` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `preset_code_unique` ON `preset` (`code`);--> statement-breakpoint
CREATE TABLE `story` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`requires` text DEFAULT '[]',
	`llmapi` text DEFAULT 'null',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `story_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `story`(`id`) ON UPDATE no action ON DELETE cascade
);
