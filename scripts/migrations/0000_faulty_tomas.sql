CREATE TABLE `comfyui_model` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`cover` text,
	`path` text,
	`url` text,
	`html` text,
	`model` text,
	`download` text,
	`importer` text,
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `comfyui_model_code_idx` ON `comfyui_model` (`code`);--> statement-breakpoint
CREATE INDEX `comfyui_model_name_idx` ON `comfyui_model` (`name`);--> statement-breakpoint
CREATE INDEX `comfyui_model_type_idx` ON `comfyui_model` (`type`);--> statement-breakpoint
CREATE TABLE `comfyui_param` (
	`master_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`config` text,
	PRIMARY KEY(`master_id`, `sequence`),
	FOREIGN KEY (`master_id`) REFERENCES `comfyui_workflow`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comfyui_workflow` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`content` text,
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `comfyui_workflow_name_idx` ON `comfyui_workflow` (`name`);--> statement-breakpoint
CREATE INDEX `comfyui_workflow_description_idx` ON `comfyui_workflow` (`description`);--> statement-breakpoint
CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`type` text NOT NULL,
	`args` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `file_hash_unique` ON `file` (`hash`);--> statement-breakpoint
CREATE TABLE `setting` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text
);
--> statement-breakpoint
CREATE TABLE `model` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`engine` text,
	`builder` text DEFAULT 'default' NOT NULL,
	`stream` integer DEFAULT true,
	`key` text,
	`iterations` integer DEFAULT 20,
	`iv` blob,
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `model_name_idx` ON `model` (`name`);--> statement-breakpoint
CREATE TABLE `preset_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`filter` text DEFAULT '' NOT NULL,
	`sorter` text DEFAULT '' NOT NULL,
	`disabled` integer DEFAULT false,
	`data` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `preset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `preset_entry_filter_idx` ON `preset_entry` (`filter`);--> statement-breakpoint
CREATE INDEX `preset_entry_sorter_idx` ON `preset_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `preset` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` text DEFAULT '1.0.0' NOT NULL,
	`cover` text,
	`opening` text,
	`variables` text,
	`description` text,
	`tags` text DEFAULT '[]',
	`requires` text DEFAULT '[]',
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `preset_name_idx` ON `preset` (`name`);--> statement-breakpoint
CREATE INDEX `preset_tags_idx` ON `preset` (`tags`);--> statement-breakpoint
CREATE TABLE `realm_history` (
	`master_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`summary` integer DEFAULT false NOT NULL,
	`variables` text DEFAULT '{}' NOT NULL,
	`inputs` text DEFAULT '[]' NOT NULL,
	`output` integer DEFAULT -1 NOT NULL,
	`outputs` text DEFAULT '[]' NOT NULL,
	PRIMARY KEY(`master_id`, `sequence`),
	FOREIGN KEY (`master_id`) REFERENCES `story`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `story_entry` (
	`master_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`entry_id` integer NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`filter` text DEFAULT '' NOT NULL,
	`sorter` text DEFAULT '' NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`master_id`, `entry_type`, `entry_id`),
	FOREIGN KEY (`master_id`) REFERENCES `story`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `story_entry_filter_idx` ON `story_entry` (`filter`);--> statement-breakpoint
CREATE INDEX `story_entry_sorter_idx` ON `story_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `story` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`model` text DEFAULT 'null',
	`presets` text DEFAULT '[]',
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `story_name_idx` ON `story` (`name`);