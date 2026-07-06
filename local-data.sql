-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 04:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alf_leila`
--

-- --------------------------------------------------------

--
-- Table structure for table `dishes`
--


--
-- Dumping data for table `dishes`
--

INSERT INTO `dishes` (`id`, `name`, `description`, `price`, `category`, `imageUrl`, `featured`, `stock`, `createdAt`) VALUES
(1, 'Molokhia Royale', 'The king\'s soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.', 285.00, 'main', '/hero-food-molokhia.jpg', 1, NULL, '2026-07-05 19:16:14'),
(2, 'Koshari Imperial', 'Cairo\'s iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.', 195.00, 'main', '/hero-food-koshari.jpg', 0, NULL, '2026-07-05 19:16:55'),
(3, 'Hamam Mahshi', 'Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.', 425.00, 'main', '/hero-food-hamam.jpg', 1, NULL, '2026-07-05 19:17:31'),
(4, 'Um Ali Gold', 'Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.', 165.00, 'dessert', '/hero-food-umali.jpg', 1, NULL, '2026-07-05 19:18:13'),
(5, 'Hawawshi', 'A classic Egyptian street food staple; crispy baladi bread stuffed entirely with a savory mixture of spiced minced beef, onions, and peppers, then oven-baked until golden.', 110.00, 'main', '/Hawawshi.png', 0, NULL, '2026-07-05 19:36:23'),
(6, 'Mahshi Warak Enab (Stuffed Grape Leaves)', 'Tender grape leaves tightly rolled and stuffed with a flavorful mixture of rice, herbs, and spices, simmered in a lemony broth.', 85.00, 'appetizer', '/Mahshi Warak Enab (Stuffed Grape Leaves).png', 0, NULL, '2026-07-05 19:38:10'),
(7, 'Konafa with Cream', 'A beloved Egyptian dessert featuring a crispy, golden-brown shredded phyllo crust soaked in sweet syrup, sandwiching a rich, velvety layer of Eshta (clotted cream).', 95.00, 'dessert', '/Konafa with Cream.png', 0, NULL, '2026-07-05 19:39:03'),
(8, 'Karkadeh (Hibiscus Tea)', 'A vibrant, deep-crimson, sweet and slightly tart infusion made from dried hibiscus flowers, served chilled as a refreshing counterpoint to any meal.', 35.00, 'beverage', '/Karkadeh (Hibiscus Tea).png', 0, NULL, '2026-07-05 19:39:55'),
(9, 'Grilled Lamb over Rice', 'Expertly marinated and grilled Egyptian lamb ribs, served on a bed of seasoned rice and garnished with parsley and pomegranate seeds. A clean and appetizing professional', 320.00, 'main', '/Grilled Lamb over Rice.png', 1, NULL, '2026-07-05 20:11:29'),
(10, 'Baba Ganoush', 'A classic Egyptian roasted eggplant dip, blended with tahini, garlic, and lemon juice. Perfectly paired with fresh warm pita bread.', 65.00, 'appetizer', '/Baba Ganoush.png', 0, NULL, '2026-07-05 20:13:00'),
(11, 'Ful Medames', 'Slow-cooked fava beans, a cornerstone of Egyptian cuisine. Served hot with olive oil, cumin, and a twist of lemon, accompanied by a hard-boiled egg.', 55.00, 'breakfast', '/Ful Medames.png', 0, NULL, '2026-07-05 20:19:56'),
(12, 'Basbousa', 'A classic, soft Egyptian semolina cake, deeply soaked in a delicate sugar syrup and infused with rose water. A timeless and beloved dessert.', 45.00, 'dessert', '/Basbousa.png', 0, NULL, '2026-07-05 20:21:50'),
(13, 'Roz Bel Laban (Egyptian Rice Pudding)', 'A comforting and creamy classic: Egyptian rice pudding, gently simmered with milk and finished with a torch-caramelized top and chopped nuts.', 40.00, 'dessert', '/Roz Bel Laban (Egyptian Rice Pudding).png', 0, NULL, '2026-07-05 20:22:50'),
(14, 'Feteer Meshaltet', 'A flaky, layered Egyptian pastry, brushed with ghee and baked to a golden crisp. Served warm with artisanal honey and black molasses for a classic, comforting breakfast.', 95.00, 'breakfast', '/Feteer Meshaltet.png', 0, NULL, '2026-07-05 20:32:52'),
(15, 'Mombar', 'Rice and herb-stuffed casings, fried until golden and crispy on the outside. A savory, flavorful Egyptian appetizer garnished with fresh parsley and sumac, served with a tangy lemon-tahini dip.', 130.00, 'appetizer', '/Mombar.png', 0, NULL, '2026-07-05 20:34:07'),
(16, 'Twisted Kunafa', 'Delicate coils of shredded filo dough intricately twisted around a rich Ashta cream filling. Glistening with sweet syrup, topped with crushed pistachios and a candied rose petal, this is a refined, modern take on a beloved classic.', 110.00, 'dessert', '/Twisted Kunafa.png', 0, NULL, '2026-07-05 20:35:09'),
(17, 'falafel', 'Perfectly golden-brown fava bean falafel patties dusted with sesame seeds and infused with herbs and spices, served on a hand-thrown ceramic plate with a rustic tahini dip and fresh Aish Baladi.', 80.00, 'breakfast', '/falafel.png', 0, NULL, '2026-07-05 20:59:02'),
(18, 'Sahlab', 'A comforting, thick and creamy milk-based pudding drink, lightly sweetened and perfumed with rose water.\nCrowned with crushed pistachios, coconut, and a dusting of cinnamon for a decadent, aromatic experience.', 85.00, 'beverage', '/Sahlab.png', 0, NULL, '2026-07-05 21:03:24'),
(19, 'Traditional Mint Tea (Shai bi Nana)', 'Dark amber hot black tea, generously steeped with a large bundle of fresh, fragrant green mint leaves. Served in a patterned glass with a subtle steam', 40.00, 'beverage', '/Traditional Mint Tea (Shai bi Nana).png', 0, NULL, '2026-07-05 21:06:54'),
(20, 'Sugar Cane Juice (Asab)', 'The authentic taste of Cairo street stands; pale, frothy, naturally sweet juice from freshly pressed sugarcane. Served chilled in a heavy glass with light condensation and a small segment.', 45.00, 'beverage', '/Freshly Pressed Sugar Cane Juice (Asab).png', 0, NULL, '2026-07-05 21:08:44'),
(21, 'Egyptian Coffee (Ahwa)', 'Finely ground, dark-roasted coffee beans simmered with cardamon for a thick, foamy, and rich espresso-like drink. Traditionally served \"Ahwa Mazboot\" (medium sweet).', 35.00, 'beverage', '/Egyptian Coffee (Ahwa).png', 0, NULL, '2026-07-05 22:33:02'),
(22, 'Tamr Hindi', 'A cool and refreshing, tart-sweet beverage made from the pulp of tamarind pods, sweetened and served chilled, often at Iftar. This drink is a classic Egyptian summer refresher.', 40.00, 'beverage', '/Tamr Hindi.png', 0, NULL, '2026-07-05 22:33:58'),
(23, 'Sobia (Coconut Rice Drink)', 'A creamy, cold Egyptian drink made from ground rice, milk, coconut milk, and sugar, blended and spiced with cinnamon. A sweet, smooth treat especially popular during Ramadan.', 45.00, 'beverage', '/Sobia (Coconut Rice Drink).png', 0, NULL, '2026-07-05 22:35:15'),
(24, 'Karkadeh Hot (Hot Hibiscus Tea)', 'A deeply rich, ruby-red infusion made from dried hibiscus calyces, served piping hot. It is full-bodied, slightly tart, and soothing, a perfect traditional winter warmer.', 30.00, 'beverage', '/Karkadeh Hot (Hot Hibiscus Tea).png', 0, NULL, '2026-07-05 22:36:11');



INSERT INTO `users` (`id`, `email`, `passwordHash`, `name`, `avatar`, `role`, `createdAt`, `updatedAt`, `lastSignInAt`) VALUES
(1, 'admin@gmail.com', '20ee1baae098f5cf47c46a11e32f75a1:3d3d2be338415a7740d1d61256194ed4c3663f180f029e004c05a26271548e63e4016e173534246c80b91bef4a5849cd0bd4f49c26231f92ad81bfe31bed7937', 'admin', NULL, 'admin', '2026-07-05 18:51:23', '2026-07-05 16:12:40', '2026-07-05 16:12:40'),
(2, 'nancy@gmail.com', '48b9aa1075eee87f72d141e88c04b370:a931fd75b0b47dfe49cd0b2d743d96465d9c1e73282aa9c1bdf28c997d8ce34eaaa5b274c39c9778a77c35c8ae368a829d369209c8e35e38a4b43b84f27c9560', 'Nancy Abduallh', NULL, 'user', '2026-07-05 20:36:57', '2026-07-05 20:36:57', '2026-07-05 20:36:57'),
(3, 'mazen@gmail.com', '0cb8d6617e132fa39925f5fa3c564dd0:ec7f9d696f93ba934cc5211a859c9c888e6e48c425884cfb980a6a58e85cb27857182e918045fecba4c87da8ff49a558e2c50c3fac2cba1c53ba231a9297f2e7', 'Mazen', NULL, 'user', '2026-07-05 20:46:38', '2026-07-05 20:46:38', '2026-07-05 20:46:38');


