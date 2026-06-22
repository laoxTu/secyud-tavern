CREATE TABLE `image_file` (
	`id` text PRIMARY KEY NOT NULL,
	`sha256` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `image_file_sha256_unique` ON `image_file` (`sha256`);