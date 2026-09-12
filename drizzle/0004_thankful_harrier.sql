CREATE TABLE `word` (
	`id` text PRIMARY KEY NOT NULL,
	`japanese` text NOT NULL,
	`reading` text NOT NULL,
	`meaning` text NOT NULL,
	`level` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `word_level_idx` ON `word` (`level`);