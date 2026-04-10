ALTER TABLE `orders` ADD `paymentMethod` enum('paypal','bank_transfer') DEFAULT 'paypal' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('unpaid','pending_verification','paid') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `stripePaymentId`;