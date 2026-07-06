-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: alf_leila
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
INSERT INTO `dishes` (`id`, `name`, `description`, `price`, `category`, `imageUrl`, `featured`, `stock`, `createdAt`) VALUES (1,'Molokhia Royale','The king\'s soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.',285.00,'main','/hero-food-molokhia.jpg',1,NULL,'2026-07-05 19:16:14'),(2,'Koshari Imperial','Cairo\'s iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.',195.00,'main','/hero-food-koshari.jpg',0,NULL,'2026-07-05 19:16:55'),(3,'Hamam Mahshi','Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.',425.00,'main','/hero-food-hamam.jpg',1,NULL,'2026-07-05 19:17:31'),(4,'Um Ali Gold','Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.',165.00,'dessert','/hero-food-umali.jpg',1,NULL,'2026-07-05 19:18:13'),(5,'Hawawshi','A classic Egyptian street food staple; crispy baladi bread stuffed entirely with a savory mixture of spiced minced beef, onions, and peppers, then oven-baked until golden.',110.00,'main','/Hawawshi.png',0,NULL,'2026-07-05 19:36:23'),(6,'Mahshi Warak Enab (Stuffed Grape Leaves)','Tender grape leaves tightly rolled and stuffed with a flavorful mixture of rice, herbs, and spices, simmered in a lemony broth.',85.00,'appetizer','/Mahshi Warak Enab (Stuffed Grape Leaves).png',0,NULL,'2026-07-05 19:38:10'),(7,'Konafa with Cream','A beloved Egyptian dessert featuring a crispy, golden-brown shredded phyllo crust soaked in sweet syrup, sandwiching a rich, velvety layer of Eshta (clotted cream).',95.00,'dessert','/Konafa with Cream.png',0,NULL,'2026-07-05 19:39:03'),(8,'Karkadeh (Hibiscus Tea)','A vibrant, deep-crimson, sweet and slightly tart infusion made from dried hibiscus flowers, served chilled as a refreshing counterpoint to any meal.',35.00,'beverage','/Karkadeh (Hibiscus Tea).png',0,NULL,'2026-07-05 19:39:55'),(9,'Grilled Lamb over Rice','Expertly marinated and grilled Egyptian lamb ribs, served on a bed of seasoned rice and garnished with parsley and pomegranate seeds. A clean and appetizing professional',320.00,'main','/Grilled Lamb over Rice.png',1,NULL,'2026-07-05 20:11:29'),(10,'Baba Ganoush','A classic Egyptian roasted eggplant dip, blended with tahini, garlic, and lemon juice. Perfectly paired with fresh warm pita bread.',65.00,'appetizer','/Baba Ganoush.png',0,NULL,'2026-07-05 20:13:00'),(11,'Ful Medames','Slow-cooked fava beans, a cornerstone of Egyptian cuisine. Served hot with olive oil, cumin, and a twist of lemon, accompanied by a hard-boiled egg.',55.00,'breakfast','/Ful Medames.png',0,NULL,'2026-07-05 20:19:56'),(12,'Basbousa','A classic, soft Egyptian semolina cake, deeply soaked in a delicate sugar syrup and infused with rose water. A timeless and beloved dessert.',45.00,'dessert','/Basbousa.png',0,NULL,'2026-07-05 20:21:50'),(13,'Roz Bel Laban (Egyptian Rice Pudding)','A comforting and creamy classic: Egyptian rice pudding, gently simmered with milk and finished with a torch-caramelized top and chopped nuts.',40.00,'dessert','/Roz Bel Laban (Egyptian Rice Pudding).png',0,NULL,'2026-07-05 20:22:50'),(14,'Feteer Meshaltet','A flaky, layered Egyptian pastry, brushed with ghee and baked to a golden crisp. Served warm with artisanal honey and black molasses for a classic, comforting breakfast.',95.00,'breakfast','/Feteer Meshaltet.png',0,NULL,'2026-07-05 20:32:52'),(15,'Mombar','Rice and herb-stuffed casings, fried until golden and crispy on the outside. A savory, flavorful Egyptian appetizer garnished with fresh parsley and sumac, served with a tangy lemon-tahini dip.',130.00,'appetizer','/Mombar.png',0,NULL,'2026-07-05 20:34:07'),(16,'Twisted Kunafa','Delicate coils of shredded filo dough intricately twisted around a rich Ashta cream filling. Glistening with sweet syrup, topped with crushed pistachios and a candied rose petal, this is a refined, modern take on a beloved classic.',110.00,'dessert','/Twisted Kunafa.png',0,NULL,'2026-07-05 20:35:09'),(17,'falafel','Perfectly golden-brown fava bean falafel patties dusted with sesame seeds and infused with herbs and spices, served on a hand-thrown ceramic plate with a rustic tahini dip and fresh Aish Baladi.',80.00,'breakfast','/falafel.png',0,NULL,'2026-07-05 20:59:02'),(18,'Sahlab','A comforting, thick and creamy milk-based pudding drink, lightly sweetened and perfumed with rose water.\nCrowned with crushed pistachios, coconut, and a dusting of cinnamon for a decadent, aromatic experience.',85.00,'beverage','/Sahlab.png',0,NULL,'2026-07-05 21:03:24'),(19,'Traditional Mint Tea (Shai bi Nana)','Dark amber hot black tea, generously steeped with a large bundle of fresh, fragrant green mint leaves. Served in a patterned glass with a subtle steam',40.00,'beverage','/Traditional Mint Tea (Shai bi Nana).png',0,NULL,'2026-07-05 21:06:54'),(20,'Sugar Cane Juice (Asab)','The authentic taste of Cairo street stands; pale, frothy, naturally sweet juice from freshly pressed sugarcane. Served chilled in a heavy glass with light condensation and a small segment.',45.00,'beverage','/Freshly Pressed Sugar Cane Juice (Asab).png',0,NULL,'2026-07-05 21:08:44'),(21,'Egyptian Coffee (Ahwa)','Finely ground, dark-roasted coffee beans simmered with cardamon for a thick, foamy, and rich espresso-like drink. Traditionally served \"Ahwa Mazboot\" (medium sweet).',35.00,'beverage','/Egyptian Coffee (Ahwa).png',0,NULL,'2026-07-05 22:33:02'),(22,'Tamr Hindi','A cool and refreshing, tart-sweet beverage made from the pulp of tamarind pods, sweetened and served chilled, often at Iftar. This drink is a classic Egyptian summer refresher.',40.00,'beverage','/Tamr Hindi.png',0,NULL,'2026-07-05 22:33:58'),(23,'Sobia (Coconut Rice Drink)','A creamy, cold Egyptian drink made from ground rice, milk, coconut milk, and sugar, blended and spiced with cinnamon. A sweet, smooth treat especially popular during Ramadan.',45.00,'beverage','/Sobia (Coconut Rice Drink).png',0,NULL,'2026-07-05 22:35:15'),(24,'Karkadeh Hot (Hot Hibiscus Tea)','A deeply rich, ruby-red infusion made from dried hibiscus calyces, served piping hot. It is full-bodied, slightly tart, and soothing, a perfect traditional winter warmer.',30.00,'beverage','/Karkadeh Hot (Hot Hibiscus Tea).png',0,NULL,'2026-07-05 22:36:11');
/*!40000 ALTER TABLE `dishes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `orderId`, `dishId`, `dishName`, `unitPrice`, `quantity`) VALUES (1,1,1,'Molokhia Royale',285.00,1),(2,1,3,'Hamam Mahshi',425.00,1),(3,1,5,'Hawawshi',110.00,1),(4,1,9,'Grilled Lamb over Rice',320.00,1),(5,2,1,'Molokhia Royale',285.00,1),(6,2,3,'Hamam Mahshi',425.00,1),(7,2,5,'Hawawshi',110.00,1),(8,2,9,'Grilled Lamb over Rice',320.00,1),(9,3,1,'Molokhia Royale',285.00,1),(10,3,3,'Hamam Mahshi',425.00,1),(11,3,5,'Hawawshi',110.00,1),(12,3,9,'Grilled Lamb over Rice',320.00,1),(13,4,2,'Koshari Imperial',195.00,1),(14,5,2,'Koshari Imperial',195.00,1),(15,6,2,'Koshari Imperial',195.00,1),(16,7,1,'Molokhia Royale',285.00,1),(17,7,3,'Hamam Mahshi',425.00,1),(18,8,1,'Molokhia Royale',285.00,1),(19,8,3,'Hamam Mahshi',425.00,1),(20,9,5,'Hawawshi',110.00,1),(21,9,6,'Mahshi Warak Enab (Stuffed Grape Leaves)',85.00,1),(22,9,9,'Grilled Lamb over Rice',320.00,1);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `page_views`
--

LOCK TABLES `page_views` WRITE;
/*!40000 ALTER TABLE `page_views` DISABLE KEYS */;
INSERT INTO `page_views` (`id`, `path`, `createdAt`) VALUES (1,'/','2026-07-05 18:50:35'),(2,'/reserve','2026-07-05 18:50:43'),(3,'/register','2026-07-05 18:50:45'),(4,'/register','2026-07-05 18:51:07'),(5,'/','2026-07-05 18:51:23'),(6,'/','2026-07-05 18:51:34'),(7,'/','2026-07-05 18:51:49'),(8,'/admin','2026-07-05 18:51:51'),(9,'/','2026-07-05 18:51:52'),(10,'/reserve','2026-07-05 18:51:53'),(11,'/login','2026-07-05 18:51:54'),(12,'/','2026-07-05 18:51:56'),(13,'/admin','2026-07-05 18:52:39'),(14,'/','2026-07-05 18:52:40'),(15,'/reserve','2026-07-05 18:52:42'),(16,'/login','2026-07-05 18:52:44'),(17,'/','2026-07-05 18:52:51'),(18,'/profile','2026-07-05 18:52:57'),(19,'/my-orders','2026-07-05 18:53:02'),(20,'/my-reservations','2026-07-05 18:53:04'),(21,'/my-reservations','2026-07-05 18:53:08'),(22,'/','2026-07-05 18:53:09'),(23,'/','2026-07-05 19:06:25'),(24,'/','2026-07-05 19:06:37'),(25,'/admin','2026-07-05 19:06:39'),(26,'/admin/login','2026-07-05 19:06:41'),(27,'/login','2026-07-05 19:06:57'),(28,'/','2026-07-05 19:07:01'),(29,'/','2026-07-05 19:07:50'),(30,'/','2026-07-05 19:08:09'),(31,'/','2026-07-05 19:11:19'),(32,'/admin/login','2026-07-05 19:11:32'),(33,'/login','2026-07-05 19:11:40'),(34,'/','2026-07-05 19:11:55'),(35,'/','2026-07-05 19:12:27'),(36,'/','2026-07-05 19:12:34'),(37,'/admin','2026-07-05 19:12:36'),(38,'/admin/login','2026-07-05 19:12:38'),(39,'/admin','2026-07-05 19:12:40'),(40,'/admin','2026-07-05 19:13:34'),(41,'/','2026-07-05 19:13:34'),(42,'/admin','2026-07-05 19:14:23'),(43,'/','2026-07-05 19:14:23'),(44,'/','2026-07-05 19:22:30'),(45,'/menu','2026-07-05 19:36:27'),(46,'/','2026-07-05 19:41:49'),(47,'/menu','2026-07-05 19:42:32'),(48,'/','2026-07-05 19:42:42'),(49,'/','2026-07-05 20:05:41'),(50,'/admin','2026-07-05 20:05:49'),(51,'/admin','2026-07-05 20:05:50'),(52,'/','2026-07-05 20:05:53'),(53,'/','2026-07-05 20:18:22'),(54,'/admin','2026-07-05 20:18:37'),(55,'/menu','2026-07-05 20:19:58'),(56,'/','2026-07-05 20:23:12'),(57,'/menu','2026-07-05 20:23:51'),(58,'/menu','2026-07-05 20:29:36'),(59,'/admin','2026-07-05 20:32:00'),(60,'/reserve','2026-07-05 20:35:42'),(61,'/','2026-07-05 20:35:52'),(62,'/','2026-07-05 20:35:56'),(63,'/reserve','2026-07-05 20:35:58'),(64,'/login','2026-07-05 20:36:19'),(65,'/register','2026-07-05 20:36:31'),(66,'/','2026-07-05 20:36:58'),(67,'/profile','2026-07-05 20:38:52'),(68,'/','2026-07-05 20:39:00'),(69,'/admin','2026-07-05 20:39:09'),(70,'/','2026-07-05 20:39:09'),(71,'/admin','2026-07-05 20:39:32'),(72,'/admin','2026-07-05 20:39:41'),(73,'/','2026-07-05 20:39:47'),(74,'/reserve','2026-07-05 20:39:49'),(75,'/admin','2026-07-05 20:41:42'),(76,'/menu','2026-07-05 20:42:01'),(77,'/checkout','2026-07-05 20:42:23'),(78,'/menu','2026-07-05 20:44:26'),(79,'/contact','2026-07-05 20:44:32'),(80,'/story','2026-07-05 20:44:37'),(81,'/','2026-07-05 20:44:46'),(82,'/','2026-07-05 20:46:15'),(83,'/login','2026-07-05 20:46:17'),(84,'/register','2026-07-05 20:46:18'),(85,'/','2026-07-05 20:46:38'),(86,'/','2026-07-05 20:52:20'),(87,'/','2026-07-05 20:52:20'),(88,'/','2026-07-05 20:52:20'),(89,'/','2026-07-05 20:52:21'),(90,'/','2026-07-05 20:52:22'),(91,'/admin','2026-07-05 20:52:22'),(92,'/','2026-07-05 20:52:35'),(93,'/','2026-07-05 20:52:42'),(94,'/admin','2026-07-05 20:52:47'),(95,'/','2026-07-05 20:54:32'),(96,'/','2026-07-05 20:54:34'),(97,'/admin','2026-07-05 20:54:35'),(98,'/','2026-07-05 20:56:28'),(99,'/admin','2026-07-05 20:56:31'),(100,'/admin','2026-07-05 20:57:51'),(101,'/menu','2026-07-05 20:59:08'),(102,'/','2026-07-05 20:59:34'),(103,'/menu','2026-07-05 21:00:51'),(104,'/menu','2026-07-05 21:11:17'),(105,'/reserve','2026-07-05 21:12:41'),(106,'/','2026-07-05 21:12:44'),(107,'/menu','2026-07-05 21:12:49'),(108,'/my-orders','2026-07-05 21:13:02'),(109,'/my-reservations','2026-07-05 21:14:09'),(110,'/','2026-07-05 21:14:17'),(111,'/','2026-07-05 21:18:09'),(112,'/admin','2026-07-05 21:18:09'),(113,'/story','2026-07-05 21:18:29'),(114,'/','2026-07-05 21:19:15'),(115,'/','2026-07-05 21:32:01'),(116,'/','2026-07-05 21:32:05'),(117,'/','2026-07-05 21:32:11'),(118,'/','2026-07-05 21:32:28'),(119,'/','2026-07-05 21:32:31'),(120,'/','2026-07-05 21:32:35'),(121,'/','2026-07-05 21:32:42'),(122,'/','2026-07-05 21:32:57'),(123,'/','2026-07-05 21:33:02'),(124,'/','2026-07-05 21:33:06'),(125,'/','2026-07-05 21:33:09'),(126,'/','2026-07-05 21:33:13'),(127,'/','2026-07-05 21:34:29'),(128,'/','2026-07-05 21:35:48'),(129,'/','2026-07-05 21:39:22'),(130,'/','2026-07-05 21:39:24'),(131,'/','2026-07-05 21:40:02'),(132,'/menu','2026-07-05 21:42:37'),(133,'/checkout','2026-07-05 21:45:36'),(134,'/checkout','2026-07-05 21:49:30'),(135,'/checkout','2026-07-05 21:49:47'),(136,'/','2026-07-05 21:50:42'),(137,'/admin','2026-07-05 21:50:47'),(138,'/admin','2026-07-05 21:50:52'),(139,'/','2026-07-05 21:51:04'),(140,'/checkout','2026-07-05 21:51:08'),(141,'/checkout','2026-07-05 22:02:11'),(142,'/checkout','2026-07-05 22:05:07'),(143,'/','2026-07-05 22:06:06'),(144,'/menu','2026-07-05 22:06:24'),(145,'/checkout','2026-07-05 22:06:33'),(146,'/checkout','2026-07-05 22:10:14'),(147,'/menu','2026-07-05 22:11:22'),(148,'/checkout','2026-07-05 22:11:30'),(149,'/admin','2026-07-05 22:12:49'),(150,'/my-orders','2026-07-05 22:16:05'),(151,'/admin','2026-07-05 22:16:18'),(152,'/menu','2026-07-05 22:16:35'),(153,'/checkout','2026-07-05 22:16:51'),(154,'/menu','2026-07-05 22:20:39'),(155,'/','2026-07-05 22:20:40'),(156,'/','2026-07-05 22:29:32'),(157,'/admin','2026-07-05 22:32:01'),(158,'/menu','2026-07-05 22:34:22'),(159,'/menu','2026-07-05 22:37:38'),(160,'/','2026-07-05 22:48:39'),(161,'/admin','2026-07-05 22:48:39'),(162,'/menu','2026-07-05 22:48:46'),(163,'/menu','2026-07-05 23:02:22'),(164,'/admin','2026-07-05 23:02:22'),(165,'/story','2026-07-05 23:22:02'),(166,'/story','2026-07-06 00:06:30'),(167,'/story','2026-07-06 00:06:38'),(168,'/story','2026-07-06 00:06:53'),(169,'/admin','2026-07-06 00:06:54');
/*!40000 ALTER TABLE `page_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` (`id`, `userId`, `name`, `email`, `phone`, `date`, `time`, `guests`, `notes`, `status`, `createdAt`) VALUES (1,2,'Nancy Abduallh','nancy@gmail.com','+201279424259','2026-11-12','14:00:00',2,'','confirmed','2026-07-05 20:41:09');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` (`id`, `userId`, `rating`, `comment`, `createdAt`) VALUES (1,2,5,'It was a great experience. Food is so delicious and looks amazing. Stuff is very friendly. Overall experience is very good','2026-07-05 20:45:46');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `email`, `passwordHash`, `name`, `avatar`, `role`, `createdAt`, `updatedAt`, `lastSignInAt`) VALUES (1,'admin@gmail.com','20ee1baae098f5cf47c46a11e32f75a1:3d3d2be338415a7740d1d61256194ed4c3663f180f029e004c05a26271548e63e4016e173534246c80b91bef4a5849cd0bd4f49c26231f92ad81bfe31bed7937','admin',NULL,'admin','2026-07-05 18:51:23','2026-07-05 16:12:40','2026-07-05 16:12:40'),(2,'nancy@gmail.com','48b9aa1075eee87f72d141e88c04b370:a931fd75b0b47dfe49cd0b2d743d96465d9c1e73282aa9c1bdf28c997d8ce34eaaa5b274c39c9778a77c35c8ae368a829d369209c8e35e38a4b43b84f27c9560','Nancy Abduallh',NULL,'user','2026-07-05 20:36:57','2026-07-05 20:36:57','2026-07-05 20:36:57'),(3,'mazen@gmail.com','0cb8d6617e132fa39925f5fa3c564dd0:ec7f9d696f93ba934cc5211a859c9c888e6e48c425884cfb980a6a58e85cb27857182e918045fecba4c87da8ff49a558e2c50c3fac2cba1c53ba231a9297f2e7','Mazen',NULL,'user','2026-07-05 20:46:38','2026-07-05 20:46:38','2026-07-05 20:46:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06  3:20:34
