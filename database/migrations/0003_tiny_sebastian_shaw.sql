PRAGMA foreign_keys= OFF;--> statement-breakpoint
CREATE TABLE `__new_llmapi_entry`
(
    `master_id`  text                  NOT NULL,
    `entry_type` text                  NOT NULL,
    `entry_id`   integer               NOT NULL,
    `search`     text    DEFAULT ''    NOT NULL,
    `sorter`     text    DEFAULT ''    NOT NULL,
    `disabled`   integer DEFAULT false NOT NULL,
    `content`    text                  NOT NULL,
    PRIMARY KEY (`master_id`, `entry_type`, `entry_id`),
    FOREIGN KEY (`master_id`) REFERENCES `llmapi` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_llmapi_entry`("master_id", "entry_type", "entry_id", "search", "sorter", "disabled", "content")
SELECT "master_id", "entry_type", "entry_id", "search", '', "disabled", "content"
FROM `llmapi_entry`;--> statement-breakpoint
DROP TABLE `llmapi_entry`;--> statement-breakpoint
ALTER TABLE `__new_llmapi_entry`
    RENAME TO `llmapi_entry`;--> statement-breakpoint
PRAGMA foreign_keys= ON;--> statement-breakpoint
CREATE INDEX `llmapi_entry_search_idx` ON `llmapi_entry` (`search`);--> statement-breakpoint
CREATE INDEX `llmapi_entry_sorter_idx` ON `llmapi_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `__new_preset_entry`
(
    `master_id`  text                  NOT NULL,
    `entry_type` text                  NOT NULL,
    `entry_id`   integer               NOT NULL,
    `search`     text    DEFAULT ''    NOT NULL,
    `sorter`     text    DEFAULT ''    NOT NULL,
    `disabled`   integer DEFAULT false NOT NULL,
    `content`    text                  NOT NULL,
    PRIMARY KEY (`master_id`, `entry_type`, `entry_id`),
    FOREIGN KEY (`master_id`) REFERENCES `preset` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_preset_entry`("master_id", "entry_type", "entry_id", "search", "sorter", "disabled", "content")
SELECT "master_id", "entry_type", "entry_id", "search", '' , "disabled", "content"
FROM `preset_entry`;--> statement-breakpoint
DROP TABLE `preset_entry`;--> statement-breakpoint
ALTER TABLE `__new_preset_entry`
    RENAME TO `preset_entry`;--> statement-breakpoint
CREATE INDEX `preset_entry_search_idx` ON `preset_entry` (`search`);--> statement-breakpoint
CREATE INDEX `preset_entry_sorter_idx` ON `preset_entry` (`sorter`);--> statement-breakpoint
CREATE TABLE `__new_story_entry`
(
    `master_id`  text                  NOT NULL,
    `entry_type` text                  NOT NULL,
    `entry_id`   integer               NOT NULL,
    `search`     text    DEFAULT ''    NOT NULL,
    `sorter`     text    DEFAULT ''    NOT NULL,
    `disabled`   integer DEFAULT false NOT NULL,
    `content`    text                  NOT NULL,
    PRIMARY KEY (`master_id`, `entry_type`, `entry_id`),
    FOREIGN KEY (`master_id`) REFERENCES `story` (`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_story_entry`("master_id", "entry_type", "entry_id", "search", "sorter", "disabled", "content")
SELECT "master_id", "entry_type", "entry_id", "search", '', "disabled", "content"
FROM `story_entry`;--> statement-breakpoint
DROP TABLE `story_entry`;--> statement-breakpoint
ALTER TABLE `__new_story_entry`
    RENAME TO `story_entry`;--> statement-breakpoint
CREATE INDEX `story_entry_search_idx` ON `story_entry` (`search`);--> statement-breakpoint
CREATE INDEX `story_entry_sorter_idx` ON `story_entry` (`sorter`);--> statement-breakpoint
CREATE INDEX `llmapi_code_idx` ON `llmapi` (`code`);--> statement-breakpoint
CREATE INDEX `preset_code_idx` ON `preset` (`code`);--> statement-breakpoint
CREATE INDEX `llmapi_name_idx` ON `story` (`name`);