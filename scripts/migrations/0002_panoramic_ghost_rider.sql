PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE `realm_history`;--> statement-breakpoint
CREATE TABLE `realm_history` (
	`master_id` text NOT NULL,
	`sequence` integer DEFAULT 0 NOT NULL,
	`summary` integer DEFAULT false NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`variables` text DEFAULT '{}' NOT NULL,
	`index` integer DEFAULT 0 NOT NULL,
	`spaces` text DEFAULT '[]' NOT NULL,
	PRIMARY KEY(`master_id`, `sequence`),
	FOREIGN KEY (`master_id`) REFERENCES `story`(`id`) ON UPDATE cascade ON DELETE cascade
);
PRAGMA foreign_keys=ON;