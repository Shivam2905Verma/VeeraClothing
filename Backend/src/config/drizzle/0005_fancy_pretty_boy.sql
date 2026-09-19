ALTER TABLE `order_item_measurements` DROP FOREIGN KEY `order_item_measurements_order_item_id_order_items_id_fk`;
--> statement-breakpoint
ALTER TABLE `order_item_measurements` ADD `order_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `order_item_measurements` ADD CONSTRAINT `order_item_measurements_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_measurements` DROP COLUMN `order_item_id`;