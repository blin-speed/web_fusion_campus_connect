INSERT INTO settings (`key`, `value`) VALUES
('platformFeePercent', '8'),
('requireListingApproval', 'true'),
('savingsFactor', '0.25'),
('clockOffsetHours', '0'),
('dueSoonHours', '2');

INSERT INTO locations (name, lat, lng) VALUES
('Library', 19.0645, 72.8358),
('Media Arts Lab', 19.0648, 72.8360),
('Hostel 1', 19.0630, 72.8350),
('Hostel 3', 19.0632, 72.8352),
('Girls Hostel B', 19.0650, 72.8370),
('Mech Workshop', 19.0640, 72.8340),
('Canteen', 19.0642, 72.8345),
('Main Gate', 19.0635, 72.8365);

INSERT INTO categories (name) VALUES
('Filming Equipment'),
('Electronics'),
('Study Materials'),
('Sports'),
('Tools');

INSERT INTO item_types (category_id, name, keywords) VALUES
(1, 'camera', 'dslr,mirrorless,shoot,video,recording'),
(1, 'tripod', 'stand,mount,stability'),
(1, 'microphone', 'mic,audio,lavalier,sound'),
(1, 'ring light', 'lighting,led,glow'),
(2, 'laptop', 'macbook,notebook,pc,computer'),
(2, 'hdmi cable', 'wire,connector,display'),
(2, 'calculator', 'scientific,casio,math'),
(3, 'drafter', 'mini drafter,drawing,engineering'),
(3, 'textbook', 'book,notes,reference'),
(4, 'bat', 'cricket,match,willow'),
(4, 'helmet', 'protection,headgear'),
(5, 'drill', 'machine,hole,power tool');

INSERT INTO need_templates (name, trigger_keywords, required_item_types, optional_item_types) VALUES
('Video shoot', 'reel,video,shoot,film,vlog', '["camera","tripod"]', '["microphone","ring light"]'),
('Presentation', 'presentation,ppt,seminar,pitch', '["laptop","hdmi cable"]', '[]'),
('Exam/Calculus', 'exam,calculus,math,test', '["calculator"]', '[]'),
('Cricket match', 'cricket,match,tournament,play', '["bat"]', '["helmet"]'),
('Lab/Drawing', 'lab,drawing,graphics,ed', '["drafter"]', '[]');

INSERT INTO users (name, department, study_year, verification_status, location_id, bio) VALUES
('Aisha', 'CSE', '3rd Year', 'verified', 1, 'Tech enthusiast'),
('Rohan', 'IT', '2nd Year', 'verified', 3, 'Photographer'),
('Meera', 'EXTC', '4th Year', 'verified', 5, 'Sports captain'),
('Kabir', 'Mech', '1st Year', 'verified', 6, 'Maker'),
('Diya', 'Chem', '3rd Year', 'verified', 2, 'Avid reader');

-- Insert one user for login testing without location if needed (but they have locations)

INSERT INTO posts (owner_id, category_id, item_type_id, title, item_name, description, item_condition, accessories, rate_unit, rate, min_charge, security_deposit, late_fee_per_unit, retail_value, location_id, approval_status, availability) VALUES
(1, 1, 1, 'Sony Alpha A6400', 'Sony A6400', 'Great for video shoots', 'good', '["charger","18-55mm lens"]', 'DAY', 250.00, 250.00, 1500.00, 250.00, 75000.00, 1, 'approved', 'available'),
(2, 1, 2, 'Manfrotto Tripod', 'Tripod', 'Sturdy tripod', 'like_new', '["bag"]', 'DAY', 50.00, 50.00, 500.00, 50.00, 5000.00, 3, 'approved', 'available'),
(3, 4, 10, 'Kashmir Willow Bat', 'Cricket Bat', 'Ready to play', 'fair', '["grip"]', 'DAY', 100.00, 100.00, 300.00, 100.00, 2000.00, 5, 'approved', 'available');

-- Insert a historical exchange for rating/trust purposes (so Aisha has history)
INSERT INTO requests (post_id, borrower_id, status, start_at, end_at, units, agreement_snapshot) VALUES
(1, 2, 'accepted', '2025-10-01 10:00:00', '2025-10-02 10:00:00', 1, '{"resource":"Sony Alpha A6400"}');

INSERT INTO exchanges (request_id, post_id, owner_id, borrower_id, state, start_at, due_at, handed_over_at, returned_at, units, rate_unit, borrowing_charge, platform_fee_percent, platform_fee, security_deposit, transaction_amount, late_fee_per_unit, pickup_location_id, rating, review) VALUES
(1, 1, 1, 2, 'rated', '2025-10-01 10:00:00', '2025-10-02 10:00:00', '2025-10-01 10:00:00', '2025-10-02 09:30:00', 1, 'DAY', 250.00, 8.00, 20.00, 1500.00, 1770.00, 250.00, 1, 5, 'Excellent camera, easy handover.');
