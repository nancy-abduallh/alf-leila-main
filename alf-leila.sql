-- phpMyAdmin-style SQL Dump
-- Regenerated to match schema.ts (adds dine-in QR ordering tables + order/reservation fields)
-- Server version: 10.4.28-MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alf-leila`
--

-- --------------------------------------------------------

--
-- Table structure for table `dishes`
--

CREATE TABLE `dishes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `nameAr` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `descriptionAr` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('appetizer','main','dessert','beverage','breakfast') NOT NULL,
  `subcategory` enum('coffee','tea','others') DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `stock` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dishes`
--

INSERT INTO `dishes` (`id`, `name`, `nameAr`, `description`, `descriptionAr`, `price`, `category`, `subcategory`, `imageUrl`, `featured`, `stock`, `createdAt`) VALUES
(1, 'Molokhia Royale', 'ملوخية رويال', 'The king\'s soup. Fresh jute leaves in a garlic-infused broth, served with vermicelli rice and slow-roasted chicken.', 'شوربة الملوك. أوراق ملوخية طازجة في مرقة معطرة بالثوم، تُقدم مع أرز بالشعيرية ودجاج مشوي ببطء.', 285.00, 'main', NULL, '/hero-food-molokhia.jpg', 1, NULL, '2026-07-05 16:16:14'),
(2, 'Koshari ', 'كشري ', 'Cairo\'s iconic comfort, elevated. Layers of rice, lentils, pasta, and caramelized onions crowned with our secret tomato sauce.', 'أشهر أطباق القاهرة بلمسة راقية. طبقات من الأرز والعدس والمكرونة والبصل المقرمش، متوَّجة بصلصة الطماطم السرية.', 195.00, 'main', NULL, '/hero-food-koshari.jpg', 0, NULL, '2026-07-05 16:16:55'),
(3, 'Hamam Mahshi', 'حمام محشي', 'Whole pigeon stuffed with fragrant orzo and spiced ground beef, roasted to golden perfection.', 'حمام كامل محشو بالأرز اللسان المعطر واللحم المفروم المتبل، مشوي حتى الذهبية المثالية.', 425.00, 'main', NULL, '/hero-food-hamam.jpg', 1, NULL, '2026-07-05 16:17:31'),
(4, 'Um Ali Gold', 'أم علي الذهبية', 'Our crown dessert. Puff pastry baked in sweetened milk with raisins, coconut flakes, and crushed pistachios.', 'حلوى تاجنا. عجينة مورقة مخبوزة في حليب محلى مع زبيب ورقائق جوز الهند والفستق المطحون.', 165.00, 'dessert', NULL, '/hero-food-umali.jpg', 1, NULL, '2026-07-05 16:18:13'),
(5, 'Hawawshi', 'حواوشي', 'A classic Egyptian street food staple; crispy baladi bread stuffed entirely with a savory mixture of spiced minced beef, onions, and peppers, then oven-baked until golden.', 'طبق شعبي مصري كلاسيكي؛ خبز بلدي مقرمش محشو بخليط لذيذ من اللحم المفروم المتبل والبصل والفلفل، مخبوز حتى يصبح ذهبي اللون.', 110.00, 'main', NULL, '/Hawawshi.png', 0, NULL, '2026-07-05 16:36:23'),
(6, 'Mahshi Warak Enab (Stuffed Grape Leaves)', 'محشي ورق عنب', 'Tender grape leaves tightly rolled and stuffed with a flavorful mixture of rice, herbs, and spices, simmered in a lemony broth.', 'ورق عنب طري ملفوف بإحكام ومحشو بخليط شهي من الأرز والأعشاب والتوابل، مطهو ببطء في مرقة بنكهة الليمون.', 85.00, 'appetizer', NULL, '/Mahshi Warak Enab (Stuffed Grape Leaves).png', 0, NULL, '2026-07-05 16:38:10'),
(7, 'Konafa with Cream', 'كنافة بالقشطة', 'A beloved Egyptian dessert featuring a crispy, golden-brown shredded phyllo crust soaked in sweet syrup, sandwiching a rich, velvety layer of Eshta (clotted cream).', 'حلوى مصرية محبوبة من كنافة مقرمشة ذهبية منقوعة في شراب حلو، تحتضن طبقة غنية وناعمة من القشطة.', 95.00, 'dessert', NULL, '/Konafa with Cream.png', 0, NULL, '2026-07-05 16:39:03'),
(8, 'Karkadeh (Hibiscus Tea)', 'كركديه', 'A vibrant, deep-crimson, sweet and slightly tart infusion made from dried hibiscus flowers, served chilled as a refreshing counterpoint to any meal.', 'مشروب أحمر قاني من زهور الكركديه المجففة، حلو ولاذع قليلاً، يُقدم مثلجًا كخيار منعش يوازن أي وجبة.', 35.00, 'beverage', 'tea', '/Karkadeh (Hibiscus Tea).png', 0, NULL, '2026-07-05 16:39:55'),
(9, 'Grilled Lamb over Rice', 'ريش ضاني مشوية على الأرز', 'Expertly marinated and grilled Egyptian lamb ribs, served on a bed of seasoned rice and garnished with parsley and pomegranate seeds.', 'ريش ضاني مصرية متبلة ومشوية باحترافية، تُقدم فوق طبقة من الأرز المتبل ومزينة بالبقدونس وحبات الرمان.', 320.00, 'main', NULL, '/Grilled Lamb over Rice.png', 1, NULL, '2026-07-05 17:11:29'),
(10, 'Baba Ganoush', 'بابا غنوج', 'A classic Egyptian roasted eggplant dip, blended with tahini, garlic, and lemon juice. Perfectly paired with fresh warm pita bread.', 'متبل باذنجان مشوي كلاسيكي، ممزوج بالطحينة والثوم وعصير الليمون. يُقدم مع خبز عربي دافئ وطازج.', 65.00, 'appetizer', NULL, '/Baba Ganoush.png', 0, NULL, '2026-07-05 17:13:00'),
(11, 'Ful Medames', 'فول مدمس', 'Slow-cooked fava beans, a cornerstone of Egyptian cuisine. Served hot with olive oil, cumin, and a twist of lemon, accompanied by a hard-boiled egg.', 'فول مطهو ببطء، ركيزة أساسية في المطبخ المصري. يُقدم ساخنًا مع زيت الزيتون والكمون ولمسة من الليمون، برفقة بيضة مسلوقة.', 55.00, 'breakfast', NULL, '/Ful Medames.png', 0, NULL, '2026-07-05 17:19:56'),
(12, 'Basbousa', 'بسبوسة', 'A classic, soft Egyptian semolina cake, deeply soaked in a delicate sugar syrup and infused with rose water. A timeless and beloved dessert.', 'كيكة سميد مصرية طرية وكلاسيكية، منقوعة جيدًا بشراب سكري رقيق ومعطرة بماء الورد. حلوى خالدة ومحبوبة.', 45.00, 'dessert', NULL, '/Basbousa.png', 0, NULL, '2026-07-05 17:21:50'),
(13, 'Roz Bel Laban (Egyptian Rice Pudding)', 'رز بلبن', 'A comforting and creamy classic: Egyptian rice pudding, gently simmered with milk and finished with a torch-caramelized top and chopped nuts.', 'كلاسيكية كريمية ومريحة: أرز باللبن مصري مطهو برفق مع الحليب، ومزين بطبقة مكرملة من الأعلى ومكسرات مفرومة.', 40.00, 'dessert', NULL, '/Roz Bel Laban (Egyptian Rice Pudding).png', 0, NULL, '2026-07-05 17:22:50'),
(14, 'Feteer Meshaltet', 'فطير مشلتت', 'A flaky, layered Egyptian pastry, brushed with ghee and baked to a golden crisp. Served warm with artisanal honey and black molasses for a classic, comforting breakfast.', 'فطيرة مصرية متعددة الطبقات ومقرمشة، مدهونة بالسمن ومخبوزة حتى تصبح ذهبية اللون. تُقدم دافئة مع العسل والعسل الأسود لإفطار كلاسيكي ومريح.', 95.00, 'breakfast', NULL, '/Feteer Meshaltet.png', 0, NULL, '2026-07-05 17:32:52'),
(15, 'Mombar', 'ممبار', 'Rice and herb-stuffed casings, fried until golden and crispy on the outside. A savory, flavorful Egyptian appetizer garnished with fresh parsley and sumac, served with a tangy lemon-tahini dip.', 'أمعاء محشوة بالأرز والأعشاب، مقلية حتى تصبح ذهبية ومقرمشة من الخارج. مقبلات مصرية شهية مزينة بالبقدونس الطازج والسماق، تُقدم مع غموس طحينة بالليمون.', 130.00, 'appetizer', NULL, '/Mombar.png', 0, NULL, '2026-07-05 17:34:07'),
(16, 'Twisted Kunafa', 'كنافة مبرومة', 'Delicate coils of shredded filo dough intricately twisted around a rich Ashta cream filling. Glistening with sweet syrup, topped with crushed pistachios and a candied rose petal.', 'لفائف رقيقة من عجينة الكنافة الملفوفة بعناية حول حشوة غنية من قشطة العشطة. لامعة بالشراب الحلو، ومزينة بالفستق المطحون وبتلة ورد مسكرة.', 110.00, 'dessert', NULL, '/Twisted Kunafa.png', 0, NULL, '2026-07-05 17:35:09'),
(17, 'Falafel', 'فلافل', 'Perfectly golden-brown fava bean falafel patties dusted with sesame seeds and infused with herbs and spices, served with tahini dip and fresh Aish Baladi.', 'أقراص فلافل من الفول بلون ذهبي مثالي، مرشوشة بحبوب السمسم ومعطرة بالأعشاب والتوابل، تُقدم مع غموس الطحينة والعيش البلدي الطازج.', 80.00, 'breakfast', NULL, '/falafel.png', 0, NULL, '2026-07-05 17:59:02'),
(18, 'Sahlab', 'سحلب', 'A comforting, thick and creamy milk-based pudding drink, lightly sweetened and perfumed with rose water. Crowned with crushed pistachios, coconut, and cinnamon.', 'مشروب مريح كثيف وكريمي من الحليب، محلى قليلاً ومعطر بماء الورد. متوَّج بالفستق المطحون وجوز الهند والقرفة.', 85.00, 'beverage', 'others', '/Sahlab.png', 0, NULL, '2026-07-05 18:03:24'),
(19, 'Traditional Mint Tea (Shai bi Nana)', 'شاي بالنعناع', 'Dark amber hot black tea, generously steeped with fresh mint leaves.', 'شاي أسود ساخن بلون كهرماني داكن، منقوع بسخاء بأوراق النعناع الطازجة.', 40.00, 'beverage', 'tea', '/Traditional Mint Tea (Shai bi Nana).png', 0, NULL, '2026-07-05 18:06:54'),
(20, 'Sugar Cane Juice (Asab)', 'عصير قصب', 'Freshly pressed sugar cane juice served chilled.', 'عصير قصب طازج ومعصور حديثًا، يُقدم مثلجًا.', 45.00, 'beverage', 'others', '/Freshly Pressed Sugar Cane Juice (Asab).png', 0, NULL, '2026-07-05 18:08:44'),
(21, 'Egyptian Coffee (Ahwa)', 'قهوة مصرية', 'Finely ground, dark-roasted coffee beans simmered with cardamom for a thick, rich traditional coffee.', 'حبوب قهوة محمصة داكنة ومطحونة ناعمًا، مطهوة مع الهيل لقهوة تقليدية كثيفة وغنية.', 35.00, 'beverage', 'coffee', '/Egyptian Coffee (Ahwa).png', 0, NULL, '2026-07-05 19:33:02'),
(22, 'Tamr Hindi', 'تمر هندي', 'A cool and refreshing tamarind drink, sweetened and served chilled.', 'مشروب تمر هندي بارد ومنعش، محلى ويُقدم مثلجًا.', 40.00, 'beverage', 'others', '/Tamr Hindi.png', 0, NULL, '2026-07-05 19:33:58'),
(23, 'Sobia (Coconut Rice Drink)', 'سوبيا', 'A creamy Egyptian drink made from rice, milk, coconut milk, and cinnamon.', 'مشروب مصري كريمي مصنوع من الأرز والحليب وحليب جوز الهند والقرفة.', 45.00, 'beverage', 'others', '/Sobia (Coconut Rice Drink).png', 0, NULL, '2026-07-05 19:35:15'),
(24, 'Karkadeh Hot (Hot Hibiscus Tea)', 'كركديه ساخن', 'A deeply rich, ruby-red hot hibiscus infusion, slightly tart and soothing.', 'مشروب كركديه ساخن غني بلون ياقوتي، لاذع قليلاً ومهدئ.', 30.00, 'beverage', 'tea', '/Karkadeh Hot (Hot Hibiscus Tea).png', 0, NULL, '2026-07-05 19:36:11');

-- --------------------------------------------------------

--
-- Table structure for table `tables`
-- Physical restaurant tables, used by the dine-in QR ordering flow.
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `tableNumber` varchar(20) NOT NULL,
  `seats` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table_qr_codes`
-- Every printed QR code resolves to a tableId; a table can have several codes.
--

CREATE TABLE `table_qr_codes` (
  `id` int(11) NOT NULL,
  `tableId` int(11) NOT NULL,
  `code` varchar(64) NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table_order_batches`
-- One row per table sitting; groups orders placed within the 5-minute edit
-- window into a single ticket for the kitchen.
--

CREATE TABLE `table_order_batches` (
  `id` int(11) NOT NULL,
  `tableId` int(11) NOT NULL,
  `tableNumber` varchar(20) NOT NULL,
  `status` enum('open','sent_to_kitchen','cancelled') NOT NULL DEFAULT 'open',
  `opensAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `sendAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `sentAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
-- Adds dine-in support: orderSource, tableId/tableNumber/batchId, editableUntil.
-- phone/address/city are now nullable since dine-in orders don't use them.
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` enum('pending_edit','pending','paid','preparing','delivered','failed','cancelled') NOT NULL DEFAULT 'pending',
  `orderSource` enum('delivery','dine_in') NOT NULL DEFAULT 'delivery',
  `totalAmount` decimal(10,2) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `paymobOrderId` varchar(64) DEFAULT NULL,
  `tableId` int(11) DEFAULT NULL,
  `tableNumber` varchar(20) DEFAULT NULL,
  `batchId` int(11) DEFAULT NULL,
  `editableUntil` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `dishId` int(11) NOT NULL,
  `dishName` varchar(100) NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page_views`
--

CREATE TABLE `page_views` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_views`
--

INSERT INTO `page_views` (`id`, `path`, `createdAt`) VALUES
(1, '/', '2026-07-18 02:33:11'),
(2, '/menu', '2026-07-18 02:33:55'),
(3, '/login', '2026-07-18 02:34:39'),
(4, '/', '2026-07-18 02:34:45'),
(5, '/', '2026-07-18 02:34:48'),
(6, '/admin', '2026-07-18 02:35:16'),
(7, '/admin/login', '2026-07-18 02:35:16'),
(8, '/admin', '2026-07-18 02:36:06'),
(9, '/contact', '2026-07-18 02:37:03'),
(10, '/story', '2026-07-18 02:37:08'),
(11, '/', '2026-07-18 02:37:21'),
(12, '/', '2026-07-21 06:23:53'),
(13, '/menu', '2026-07-21 06:24:27'),
(14, '/', '2026-07-21 08:57:33'),
(15, '/menu', '2026-07-21 09:10:28'),
(16, '/', '2026-07-21 09:11:02'),
(17, '/', '2026-07-21 15:21:40'),
(18, '/menu', '2026-07-21 15:24:46'),
(19, '/', '2026-07-21 15:24:55'),
(20, '/', '2026-07-22 08:10:01'),
(21, '/', '2026-07-22 08:16:42'),
(22, '/', '2026-07-22 08:20:00'),
(23, '/', '2026-07-22 08:29:17'),
(24, '/', '2026-07-22 08:40:30'),
(25, '/admin', '2026-07-22 08:41:28'),
(26, '/admin/login', '2026-07-22 08:41:28'),
(27, '/admin', '2026-07-22 08:49:43'),
(28, '/admin', '2026-07-22 09:00:50'),
(29, '/', '2026-07-22 09:00:51'),
(30, '/', '2026-07-22 09:04:45'),
(31, '/', '2026-07-22 09:08:53'),
(32, '/', '2026-07-22 09:14:15'),
(33, '/admin', '2026-07-22 09:20:43'),
(34, '/reserve', '2026-07-22 09:28:06'),
(35, '/', '2026-07-22 09:28:10'),
(36, '/login', '2026-07-22 09:32:24'),
(37, '/', '2026-07-22 09:32:35'),
(38, '/story', '2026-07-22 09:37:47'),
(39, '/contact', '2026-07-22 09:38:04'),
(40, '/', '2026-07-22 09:38:16'),
(41, '/', '2026-07-22 09:59:04'),
(42, '/admin', '2026-07-22 10:05:47'),
(43, '/menu', '2026-07-22 10:06:02'),
(44, '/', '2026-07-22 11:22:34'),
(45, '/admin', '2026-07-22 11:22:34'),
(46, '/admin', '2026-07-22 11:32:46'),
(47, '/', '2026-07-22 11:32:59'),
(48, '/', '2026-07-22 17:13:08'),
(49, '/menu', '2026-07-22 17:32:55'),
(50, '/reserve', '2026-07-22 17:33:01'),
(51, '/', '2026-08-04 08:09:15'),
(52, '/contact', '2026-08-04 08:09:32'),
(53, '/', '2026-08-04 08:09:37'),
(54, '/', '2026-08-08 09:26:15'),
(55, '/menu', '2026-08-08 09:26:49'),
(56, '/', '2026-08-08 09:27:04'),
(57, '/', '2026-08-08 09:29:48'),
(58, '/menu', '2026-08-08 09:47:23'),
(59, '/', '2026-08-08 09:47:37'),
(60, '/admin', '2026-08-08 09:47:56'),
(61, '/', '2026-08-08 09:47:59'),
(62, '/admin/login', '2026-08-08 09:48:37'),
(63, '/admin/login', '2026-08-08 09:51:41'),
(64, '/admin', '2026-08-08 09:53:07'),
(65, '/admin', '2026-08-08 09:53:17'),
(66, '/login', '2026-08-08 10:13:41'),
(67, '/', '2026-08-08 10:14:08'),
(68, '/', '2026-08-08 10:17:44'),
(69, '/admin', '2026-08-08 11:36:18'),
(70, '/', '2026-08-08 11:36:19'),
(71, '/admin/login', '2026-08-08 11:36:23'),
(72, '/admin', '2026-08-08 11:36:33'),
(73, '/login', '2026-08-08 11:36:53'),
(74, '/', '2026-08-08 11:37:06'),
(75, '/menu', '2026-08-08 11:38:50'),
(76, '/admin', '2026-08-08 11:42:58'),
(77, '/menu', '2026-08-08 11:42:58'),
(78, '/admin', '2026-08-08 11:42:59'),
(79, '/', '2026-08-08 11:43:02'),
(80, '/admin', '2026-08-08 11:43:35'),
(81, '/menu', '2026-08-08 11:43:35'),
(82, '/', '2026-08-08 11:43:37'),
(83, '/checkout', '2026-08-08 11:44:14'),
(84, '/checkout', '2026-08-08 11:44:46'),
(85, '/admin', '2026-08-08 11:44:46'),
(86, '/', '2026-08-08 11:44:46'),
(87, '/checkout', '2026-08-08 11:46:47'),
(88, '/admin', '2026-08-08 11:46:47'),
(89, '/', '2026-08-08 11:46:48'),
(90, '/admin', '2026-08-08 11:49:17'),
(91, '/checkout', '2026-08-08 11:49:17'),
(92, '/', '2026-08-08 11:49:18'),
(93, '/admin', '2026-08-08 11:49:47'),
(94, '/', '2026-08-08 11:49:47'),
(95, '/checkout', '2026-08-08 11:49:47'),
(96, '/admin', '2026-08-08 11:50:01'),
(97, '/checkout', '2026-08-08 11:50:02'),
(98, '/', '2026-08-08 11:50:02'),
(99, '/checkout', '2026-08-08 11:50:32'),
(100, '/admin', '2026-08-08 11:50:33'),
(101, '/', '2026-08-08 11:50:33'),
(102, '/admin', '2026-08-08 11:51:19'),
(103, '/', '2026-08-08 11:51:19'),
(104, '/checkout', '2026-08-08 11:51:19'),
(105, '/admin/login', '2026-08-08 11:52:33'),
(106, '/', '2026-08-08 11:52:48'),
(107, '/admin', '2026-08-08 11:53:03'),
(108, '/menu', '2026-08-08 11:53:09'),
(109, '/checkout', '2026-08-08 11:53:49'),
(110, '/checkout', '2026-08-08 12:13:40'),
(111, '/admin', '2026-08-08 12:13:40'),
(112, '/menu', '2026-08-08 12:14:00'),
(113, '/checkout', '2026-08-08 12:14:24'),
(114, '/login', '2026-08-08 12:14:27'),
(115, '/', '2026-08-08 12:14:40'),
(116, '/checkout', '2026-08-08 12:14:44'),
(117, '/', '2026-08-08 12:19:37'),
(118, '/checkout', '2026-08-08 12:25:29'),
(119, '/admin/login', '2026-08-08 12:25:58'),
(120, '/admin', '2026-08-08 12:26:11'),
(121, '/my-orders', '2026-08-08 12:26:35'),
(122, '/my-orders', '2026-08-08 12:26:43'),
(123, '/login', '2026-08-08 12:26:52'),
(124, '/', '2026-08-08 12:26:56'),
(125, '/my-orders', '2026-08-08 12:26:58'),
(126, '/my-orders', '2026-08-08 12:27:25'),
(127, '/admin', '2026-08-08 12:27:25'),
(128, '/', '2026-08-08 12:27:27'),
(129, '/menu', '2026-08-08 12:29:51'),
(130, '/', '2026-08-08 12:30:09'),
(131, '/', '2026-08-10 07:17:30'),
(132, '/menu', '2026-08-10 07:23:02'),
(133, '/', '2026-08-10 07:24:41'),
(134, '/menu', '2026-08-10 07:29:41'),
(135, '/reserve', '2026-08-10 07:30:19'),
(136, '/story', '2026-08-10 07:30:28'),
(137, '/contact', '2026-08-10 07:30:42'),
(138, '/', '2026-08-10 07:30:50'),
(139, '/my-orders', '2026-08-23 06:01:09'),
(140, '/my-reservations', '2026-08-23 06:01:12'),
(141, '/profile', '2026-08-23 06:01:17'),
(142, '/', '2026-08-23 06:01:23'),
(143, '/menu', '2026-08-23 06:01:36'),
(144, '/', '2026-08-23 06:02:05'),
(145, '/reserve', '2026-08-23 06:02:46'),
(146, '/contact', '2026-08-23 06:02:47'),
(147, '/', '2026-08-23 06:02:59'),
(148, '/menu', '2026-08-23 06:03:28'),
(149, '/', '2026-08-23 06:05:24'),
(150, '/', '2026-08-23 06:32:18'),
(151, '/menu', '2026-08-23 06:32:26');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
-- Adds preferredArea (customer request) and tableNumber (staff assignment).
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `guests` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `preferredArea` varchar(100) DEFAULT NULL,
  `tableNumber` varchar(20) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(320) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastSignInAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `passwordHash`, `name`, `avatar`, `role`, `createdAt`, `updatedAt`, `lastSignInAt`) VALUES
(1, 'admin@gmail.com', '20ee1baae098f5cf47c46a11e32f75a1:3d3d2be338415a7740d1d61256194ed4c3663f180f029e004c05a26271548e63e4016e173534246c80b91bef4a5849cd0bd4f49c26231f92ad81bfe31bed7937', 'admin', NULL, 'admin', '2026-07-05 15:51:23', '2026-08-08 09:26:10', '2026-08-08 09:26:10'),
(2, 'nancy@gmail.com', '48b9aa1075eee87f72d141e88c04b370:a931fd75b0b47dfe49cd0b2d743d96465d9c1e73282aa9c1bdf28c997d8ce34eaaa5b274c39c9778a77c35c8ae368a829d369209c8e35e38a4b43b84f27c9560', 'Nancy Abduallh', NULL, 'user', '2026-07-05 17:36:57', '2026-08-08 09:26:55', '2026-08-08 09:26:55'),
(3, 'mazen@gmail.com', '0cb8d6617e132fa39925f5fa3c564dd0:ec7f9d696f93ba934cc5211a859c9c888e6e48c425884cfb980a6a58e85cb27857182e918045fecba4c87da8ff49a558e2c50c3fac2cba1c53ba231a9297f2e7', 'Mazen', NULL, 'user', '2026-07-05 17:46:38', '2026-07-05 17:46:38', '2026-07-05 17:46:38');

--
-- Indexes for dumped tables
--

ALTER TABLE `dishes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tables_tableNumber_unique` (`tableNumber`);

ALTER TABLE `table_qr_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `table_qr_codes_code_unique` (`code`);

ALTER TABLE `table_order_batches`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `page_views`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

ALTER TABLE `dishes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `table_qr_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `table_order_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

ALTER TABLE `page_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;