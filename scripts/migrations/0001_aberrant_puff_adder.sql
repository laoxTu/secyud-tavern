CREATE TABLE `task_history` (
	`master_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`queue` integer,
	`start` integer,
	`finish` integer,
	`result` text,
	`status` text NOT NULL,
	PRIMARY KEY(`master_id`, `attempt`),
	FOREIGN KEY (`master_id`) REFERENCES `task`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`args` text NOT NULL,
	`progress` real,
	`attempt` integer NOT NULL,
	`queue` integer,
	`start` integer,
	`finish` integer,
	`result` text,
	`status` text NOT NULL,
	`properties` text DEFAULT '{}'
);
--> statement-breakpoint
CREATE INDEX `task_name_idx` ON `task` (`name`);