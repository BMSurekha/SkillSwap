-- SkillSwap MySQL Seed Data
-- Note: All user passwords are encrypted using BCrypt. Actual password is: 'password'

USE skillswap;

-- 1. Skill Categories
INSERT INTO skill_categories (id, name, icon) VALUES
(1, 'Programming', 'code'),
(2, 'Languages', 'languages'),
(3, 'Music', 'music'),
(4, 'Design', 'palette'),
(5, 'Cooking', 'utensils'),
(6, 'Photography', 'camera'),
(7, 'Marketing', 'megaphone'),
(8, 'Fitness', 'dumbbell');

-- 2. Skills
INSERT INTO skills (id, name, category_id) VALUES
-- Programming
(1, 'Java Spring Boot', 1),
(2, 'React.js', 1),
(3, 'Python & Data Science', 1),
(19, 'Java Core Programming', 1),
(20, 'Python Programming', 1),
(21, 'C Programming', 1),
(22, 'C++ Development', 1),
-- Languages
(4, 'Spanish Conversation', 2),
(5, 'Conversational English', 2),
(6, 'Japanese for Beginners', 2),
(23, 'French Language Basics', 2),
(24, 'German Conversation', 2),
(25, 'Mandarin Chinese', 2),
(26, 'Hindi Language & Culture', 2),
-- Music
(7, 'Acoustic Guitar', 3),
(8, 'Piano & Music Theory', 3),
-- Design
(9, 'UI/UX Design in Figma', 4),
(10, 'Graphic Design', 4),
-- Cooking
(11, 'Italian Cooking', 5),
(12, 'Baking Bread & Pastries', 5),
-- Photography
(13, 'DSLR Photography Basics', 6),
(14, 'Photo Editing in Lightroom', 6),
-- Marketing
(15, 'Social Media Marketing', 7),
(16, 'SEO Optimization', 7),
-- Fitness
(17, 'Yoga & Meditation', 8),
(18, 'Strength Training', 8);

-- 3. Users
-- Passwords are BCrypt hashes of 'password'
INSERT INTO users (id, email, password, full_name, bio, location, avatar_url, role, average_rating, completed_exchanges) VALUES
(1, 'admin@skillswap.com', '$2a$10$vD2m3a8wRoxp5P9N7fNGeOzP6X3pWlD2vYI/nKj64a8Klh6qI5cve', 'System Administrator', 'Main administrator for SkillSwap platform.', 'New York, USA', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'ADMIN', 5.0, 0);
