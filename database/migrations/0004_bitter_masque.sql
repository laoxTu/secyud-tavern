CREATE TABLE `comfyui_model_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text DEFAULT '' NOT NULL,
	`sorter` text DEFAULT '' NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `comfyui_model`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comfyui_model_entry_search_idx` ON `comfyui_model_entry` (`search`);--> statement-breakpoint
CREATE INDEX `comfyui_model_entry_sorter_idx` ON `comfyui_model_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `comfyui_model` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comfyui_model_code_unique` ON `comfyui_model` (`code`);--> statement-breakpoint
CREATE INDEX `comfyui_model_code_idx` ON `comfyui_model` (`code`);--> statement-breakpoint
CREATE INDEX `comfyui_model_type_idx` ON `comfyui_model` (`type`);--> statement-breakpoint
CREATE TABLE `comfyui_workflow_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`search` text DEFAULT '' NOT NULL,
	`sorter` text DEFAULT '' NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `comfyui_workflow`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comfyui_workflow_entry_search_idx` ON `comfyui_workflow_entry` (`search`);--> statement-breakpoint
CREATE INDEX `comfyui_workflow_entry_sorter_idx` ON `comfyui_workflow_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `comfyui_workflow` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`code` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comfyui_workflow_code_unique` ON `comfyui_workflow` (`code`);--> statement-breakpoint
CREATE INDEX `comfyui_workflow_code_idx` ON `comfyui_workflow` (`code`);