CREATE TABLE `quiz_attempt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`level` integer NOT NULL,
	`questions` text NOT NULL,
	`score` integer,
	`created_at` integer NOT NULL,
	`submitted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempt_user_idx` ON `quiz_attempt` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_level_progress` (
	`user_id` text NOT NULL,
	`level` integer NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `level`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "progress_level_range" CHECK("user_level_progress"."level" between 1 and 10),
	CONSTRAINT "progress_score_range" CHECK("user_level_progress"."best_score" between 0 and 10),
	CONSTRAINT "progress_attempts_positive" CHECK("user_level_progress"."attempts" >= 0),
	CONSTRAINT "progress_status_valid" CHECK("user_level_progress"."status" in ('not_started', 'attempted', 'completed'))
);
--> statement-breakpoint
CREATE INDEX `progress_level_status_idx` ON `user_level_progress` (`level`,`status`);--> statement-breakpoint
ALTER TABLE `user` ADD `university` text;