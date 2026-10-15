SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE exchange_events;
TRUNCATE TABLE disputes;
TRUNCATE TABLE photos;
TRUNCATE TABLE exchanges;
TRUNCATE TABLE requests;
TRUNCATE TABLE demand_requests;
TRUNCATE TABLE posts;
TRUNCATE TABLE users;
TRUNCATE TABLE item_types;
TRUNCATE TABLE categories;
TRUNCATE TABLE locations;
DELETE FROM settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Platform Settings & User Credentials (all users have password: campus123)
INSERT INTO settings (`key`, `value`) VALUES
('platformFeePercent', '8.00'),
('requireListingApproval', 'false'),
('savingsFactor', '0.25'),
('clockOffsetHours', '0'),
('dueSoonHours', '24'),
('pwd_user_1', 'campus123'),
('pwd_user_2', 'campus123'),
('pwd_user_3', 'campus123'),
('pwd_user_4', 'campus123'),
('pwd_user_5', 'campus123'),
('pwd_user_6', 'campus123'),
('pwd_user_7', 'campus123'),
('pwd_user_8', 'campus123');

-- 2. Campus Locations
INSERT INTO locations (id, name, lat, lng) VALUES
(1, 'Central Library Reading Hall', 19.0645, 72.8358),
(2, 'Media & Broadcast Lab (3rd Floor)', 19.0648, 72.8360),
(3, 'Boys Hostel Block A', 19.0630, 72.8350),
(4, 'Boys Hostel Block C', 19.0632, 72.8352),
(5, 'Girls Hostel Wing B', 19.0650, 72.8370),
(6, 'Mechanical & Robotics Workshop', 19.0640, 72.8340),
(7, 'Main Campus Canteen', 19.0642, 72.8345),
(8, 'Main Gate Security Desk', 19.0635, 72.8365);

-- 3. Categories
INSERT INTO categories (id, name) VALUES
(1, 'Filming Equipment'),
(2, 'Electronics'),
(3, 'Study Materials'),
(4, 'Sports'),
(5, 'Tools');

-- 4. Item Types
INSERT INTO item_types (id, category_id, name, keywords) VALUES
(1, 1, 'camera', 'dslr,mirrorless,sony,canon,shoot,video,photography'),
(2, 1, 'tripod', 'gimbal,stabilizer,stand,manfrotto,dji'),
(3, 1, 'microphone', 'audio,rode,wireless,lavalier,mic'),
(4, 2, 'microcontroller', 'raspberry pi,esp32,arduino,fpga,jetson,embedded'),
(5, 2, 'test-instrument', 'oscilloscope,multimeter,logic analyzer,fnirsi'),
(6, 2, 'calculator', 'casio,scientific,graphing,fx-991cw'),
(7, 3, 'drafter', 'mini drafter,engineering drawing,graphics'),
(8, 3, 'textbook', 'reference book,algorithms,clrs,gate,semester notes'),
(9, 4, 'cricket-gear', 'bat,english willow,pads,kit'),
(10, 4, 'racket', 'badminton,yonex,table tennis,tt'),
(11, 5, 'soldering', 'soldering station,hot air,rework,pinecil'),
(12, 5, 'power-tool', 'bosch,drill,rotary tool,dremel,caliper');

-- 5. Realistic Campus Users (Password for all: campus123)
INSERT INTO users (id, name, department, study_year, verification_status, location_id, bio, created_at) VALUES
(1, 'Aarav Deshmukh', 'EXTC Engineering', 3, 'verified', 6, 'Embedded systems lead at Campus Robotics Club. Lending FPGA boards, logic analyzers, and lab instruments.', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(2, 'Sneha Kulkarni', 'Computer Engineering', 4, 'verified', 2, 'Head of Media Cell & documentary filmmaker. Maintaining Sony E-mount cameras, gimbals, and wireless audio gear.', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(3, 'Rohan Mehta', 'Information Technology', 2, 'verified', 3, 'Full-stack dev & hardware tinkerer. Running edge-compute nodes on Raspberry Pi and ESP32 clusters.', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(4, 'Priya Nair', 'AI & Data Science', 3, 'verified', 5, 'Competitive programmer & GATE aspirant. Sharing core CS reference textbooks, graphing calculators, and tablets.', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(5, 'Vikramaditya Joshi', 'Mechanical Engineering', 4, 'verified', 6, 'Formula Student fabrication lead. Precision measuring tools, Bosch cordless kits, and drafting hardware.', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(6, 'Ananya Sawant', 'Electronics & Computer Science', 2, 'verified', 1, 'IoT researcher and PCB designer. Lending soldering stations, multimeters, and sensor kits.', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(7, 'Siddharth Patil', 'Information Technology', 3, 'verified', 4, 'Inter-college badminton & cricket coordinator. Keeping tournament-grade sports gear available for hostel matches.', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(8, 'Kavya Iyer', 'Computer Engineering', 1, 'verified', 5, 'First-year engineering student. Frequently borrowing workshop tools and exam calculators.', DATE_SUB(NOW(), INTERVAL 10 DAY));

-- 6. Production Inventory Listings (16 items across all 5 categories)
INSERT INTO posts (id, owner_id, category_id, item_type_id, title, item_name, description, item_condition, accessories, borrowing_conditions, rate_unit, rate, min_charge, security_deposit, late_fee_per_unit, max_duration_units, retail_value, location_id, pickup_note, approval_status, availability, flagged, created_at) VALUES
-- Category 1: Filming Equipment
(1, 2, 1, 1, 'Sony Alpha A6400 Mirrorless + 16-50mm OSS Lens', 'Sony A6400 Kit', '4K 30p mirrorless camera with real-time eye AF. Ideal for cultural fest coverage, club reels, and short film projects. Sensor cleaned last week.', 'like_new', '["16-50mm Power Zoom Lens","2x NP-FW50 Batteries","64GB UHS-I SD Card","Dual USB Charger","Padded Shoulder Bag"]', 'Must verify student ID at handover. Do not expose to rain or dust without lens cover.', 'DAY', 350.00, 350.00, 2000.00, 200.00, 5, 78000.00, 2, 'Meet at Media Lab 3rd Floor between 10 AM and 5 PM.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 2, 1, 2, 'DJI RS 3 Mini 3-Axis Mirrorless Gimbal', 'DJI RS 3 Mini', 'Lightweight 795g stabilizer supporting horizontal and native vertical shooting for festival aftermovies and Instagram reels. Bluetooth shutter control supported.', 'like_new', '["Quick-Release Plate","Extended Grip Tripod","USB-C Multi-Camera Control Cable","Carry Case"]', 'Balance all 3 axes before powering on the motors.', 'DAY', 200.00, 200.00, 1200.00, 150.00, 4, 29000.00, 2, 'Available at Media Lab or Main Canteen.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 21 DAY)),
(3, 7, 1, 3, 'Rode Wireless GO II Dual Channel Mic System', 'Rode Wireless GO II', 'Dual-channel wireless lavalier microphone system with onboard recording and 200m range. Connects directly to cameras, laptops, and phones via USB-C or 3.5mm TRS.', 'good', '["2x Transmitters","1x Receiver","3x Fur Windshields","3.5mm TRS Cable","USB-C Splitter"]', 'Return with transmitters charged above 50%.', 'DAY', 150.00, 150.00, 1000.00, 100.00, 5, 26500.00, 4, 'Pickup at Boys Hostel Block C lobby.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 17 DAY)),
(4, 3, 1, 2, 'Manfrotto Compact Action Fluid Video Tripod', 'Manfrotto Tripod', 'Aluminum 5-section tripod with joystick ergonomic head and quick-release wheel. Supports DSLR/mirrorless rigs up to 1.5kg.', 'good', '["Quick Release Plate","Padded Carry Bag"]', 'Ensure the circular quick-release plate is returned with the head.', 'DAY', 80.00, 80.00, 500.00, 50.00, 7, 6500.00, 3, 'Boys Hostel Block A reception.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 14 DAY)),

-- Category 2: Electronics
(5, 1, 2, 5, 'FNIRSI 1013D 2-Channel 100MHz Digital Storage Oscilloscope', 'FNIRSI 1013D Oscilloscope', '7-inch capacitive touchscreen portable tablet oscilloscope (1GSa/s sampling rate). Essential for debugging PWM, I2C, SPI, and analog filter circuits in EXTC/ECS labs.', 'like_new', '["2x 100MHz P6100 Probes","1x High-Voltage 100X Probe","USB-C Charging Cable","EVA Hard Case"]', 'Do not exceed 40V peak input on 1X probe setting.', 'DAY', 180.00, 180.00, 1500.00, 120.00, 4, 14500.00, 6, 'Mechanical & Robotics Workshop bench #4.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 3, 2, 4, 'Raspberry Pi 5 (8GB RAM) + Active Cooler & NVMe Hat', 'Raspberry Pi 5 8GB Kit', 'Complete edge computing and IoT gateway setup. Includes official 27W USB-C PD power supply, active PWM cooler, and 64GB A2 microSD pre-flashed with Bookworm OS.', 'new', '["Official 27W USB-C Power Supply","Active Cooler","Micro-HDMI to HDMI Cable","64GB SanDisk Extreme microSD"]', 'You may flash your own SD card or use the included one.', 'DAY', 120.00, 120.00, 1000.00, 80.00, 7, 11200.00, 1, 'Central Library entrance desk.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 16 DAY)),
(7, 6, 2, 5, 'Saleae Logic 8 (8-Channel 24MHz USB Logic Analyzer) + ESP32 Kit', 'Logic Analyzer & ESP32', '8-channel digital logic analyzer compatible with PulseView/Logic2, paired with two ESP32-WROOM-32D dev boards and breadboard jumper kit for embedded debugging.', 'good', '["8-Channel Logic Analyzer Pod","10x Micro-Hook Test Clips","2x ESP32 DevKit V1","830-Point Breadboard","USB Data Cable"]', 'Keep all 10 micro-hook test clips attached to the harness.', 'DAY', 70.00, 70.00, 400.00, 50.00, 7, 3200.00, 1, 'Central Library Reading Hall.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(8, 4, 2, 6, 'Casio fx-991CW ClassWiz Non-Programmable Scientific Calculator', 'Casio fx-991CW', 'AICTE/University exam-approved scientific calculator with high-resolution 4-gradation display, matrix/vector solver, and numerical integration.', 'like_new', '["Hard Slide-On Cover"]', 'No pencil marks on the hard cover.', 'DAY', 30.00, 30.00, 250.00, 30.00, 5, 1595.00, 5, 'Girls Hostel Wing B or Central Library.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 9 DAY)),

-- Category 3: Study Materials
(9, 4, 3, 8, 'Introduction to Algorithms (CLRS 4th Edition - Hardcover)', 'CLRS Algorithms 4e', 'Clean, unhighlighted hardcover copy of Cormen, Leiserson, Rivest, and Stein (4th Ed). Great for DAA viva prep, coding interviews, and open-book assignments.', 'like_new', '["Printed Formula & Recurrence Cheat Sheet"]', 'Strictly no pen/highlighter markings inside.', 'DAY', 40.00, 40.00, 400.00, 25.00, 10, 4200.00, 1, 'Central Library 2nd floor.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 19 DAY)),
(10, 5, 3, 7, 'Omega Pro Engineering Mini Drafter + Sheet Holder Tube', 'Omega Mini Drafter', 'Smooth zero-play stainless steel arm mini drafter with extendable drawing sheet tube and 30/60 set squares for FE Engineering Graphics practical exams.', 'good', '["Omega Mini Drafter","Telescopic Drawing Tube","Sheet Clips (Set of 4)"]', 'Wipe the acrylic scale with a dry cloth before returning.', 'DAY', 35.00, 35.00, 200.00, 25.00, 7, 1100.00, 6, 'Mechanical Workshop.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(11, 1, 3, 8, 'Microelectronic Circuits by Sedra & Smith (8th Oxford Edition)', 'Sedra & Smith 8e', 'Standard reference textbook for Analog Electronics, MOSFET/BJT amplifier design, and VLSI courses. Includes solved university paper booklet.', 'good', '["Solved End-Sem PYQ Booklet"]', 'Handle spine carefully.', 'DAY', 30.00, 30.00, 300.00, 20.00, 10, 1450.00, 1, 'Central Library.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Category 4: Sports
(12, 7, 4, 9, 'SG Sunny Tonny Grade-2 English Willow Cricket Bat (Short Handle)', 'SG English Willow Bat', 'Fully knocked-in, oiled Grade-2 English willow bat (1170g, thick edges, 8 straight grains). Ready for leather ball inter-department matches.', 'good', '["Padded Full-Length Bat Cover","Extra Chevron Grip"]', 'For turf/mat pitch use only—do not use on bare concrete.', 'DAY', 140.00, 140.00, 800.00, 100.00, 4, 11500.00, 4, 'Boys Hostel Block C.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(13, 7, 4, 10, 'Yonex Astrox 99 Play Carbon Graphite Badminton Racket Pair', 'Yonex Astrox 99 Pair', 'Pair of head-heavy carbon graphite rackets strung with Yonex BG65 Titanium at 26 lbs tension, plus a tube of Mavis 350 nylon shuttles.', 'like_new', '["2x Yonex Astrox Rackets","Full Zip Thermal Cover","3x Yonex Mavis 350 Shuttles"]', 'Inspect string bed at handover and return.', 'DAY', 90.00, 90.00, 500.00, 60.00, 4, 7200.00, 7, 'Main Campus Canteen.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- Category 5: Tools
(14, 6, 5, 11, 'Pinecil V2 Smart Mini Portable Soldering Iron + 65W GaN PD Kit', 'Pinecil V2 Soldering Kit', 'PID temperature-controlled RISC-V smart soldering iron (heats to 350C in 6 seconds). Includes 65W USB-C GaN charger, silicone cable, brass wool cleaner, and 60/40 rosin solder.', 'like_new', '["Pinecil V2 Iron","65W GaN PD Adapter","High-Temp Silicone USB-C Cable","Stand & Brass Tip Cleaner","Solder Wire Roll","Desoldering Pump"]', 'Always tin the tip before powering off.', 'DAY', 90.00, 90.00, 600.00, 60.00, 5, 5800.00, 6, 'Mechanical & Robotics Workshop.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(15, 5, 5, 12, 'Bosch GSB 120-LI 12V Cordless Impact Drill & 46-Piece Bit Set', 'Bosch 12V Cordless Drill', 'Dual-speed cordless drill/driver with 2x 2.0Ah Li-Ion batteries and full HSS metal/wood drill and screwdriver bit kit for hackathon hardware enclosures and robotics.', 'good', '["Bosch GSB 120-LI Drill","2x 12V 2.0Ah Batteries","GAL 1210 CV Charger","46-Piece Bit & Socket Case","Hard Carry Case"]', 'Return all drill bits to their numbered slots in the case.', 'DAY', 160.00, 160.00, 1000.00, 100.00, 4, 8900.00, 6, 'Mechanical & Robotics Workshop.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(16, 5, 5, 12, 'Mitutoyo 150mm (6-Inch) Stainless Steel Digital Vernier Caliper', 'Mitutoyo Digital Caliper', '0.01mm resolution hardened stainless steel digital caliper for CAD reverse-engineering and 3D print tolerance verification.', 'like_new', '["Hard Molded Storage Case","Spare SR44 Battery"]', 'Wipe jaws clean before storing in the hard case.', 'DAY', 60.00, 60.00, 500.00, 40.00, 5, 6800.00, 6, 'Mechanical & Robotics Workshop.', 'approved', 'available', false, DATE_SUB(NOW(), INTERVAL 4 DAY));

-- 7. Historical Completed & Rated Exchanges (So Trust Scores, Impact Metrics, and Admin Ledger are live)
INSERT INTO requests (id, post_id, borrower_id, status, start_at, end_at, units, message, agreement_snapshot, created_at) VALUES
(1, 1, 3, 'accepted', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), 2, 'Covering the annual hackathon inauguration ceremony.', '{"accepted":true,"resource":"Sony Alpha A6400 Mirrorless + 16-50mm OSS Lens"}', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(2, 5, 6, 'accepted', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 1, 'Debugging I2C timing glitch on our sensor node.', '{"accepted":true,"resource":"FNIRSI 1013D 2-Channel 100MHz Digital Storage Oscilloscope"}', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(3, 6, 4, 'accepted', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 2, 'Benchmarking quantized ONNX model inference on ARM64.', '{"accepted":true,"resource":"Raspberry Pi 5 (8GB RAM) + Active Cooler & NVMe Hat"}', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(4, 15, 1, 'accepted', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 1, 'Drilling aluminum chassis mounts for rover bot.', '{"accepted":true,"resource":"Bosch GSB 120-LI 12V Cordless Impact Drill & 46-Piece Bit Set"}', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 12, 3, 'accepted', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 1, 'IT vs CSE quarter-final match.', '{"accepted":true,"resource":"SG Sunny Tonny Grade-2 English Willow Cricket Bat (Short Handle)"}', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 14, 8, 'accepted', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 'Soldering header pins for first-year mini project.', '{"accepted":true,"resource":"Pinecil V2 Smart Mini Portable Soldering Iron + 65W GaN PD Kit"}', DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO exchanges (id, request_id, post_id, owner_id, borrower_id, state, start_at, due_at, handed_over_at, returned_at, units, rate_unit, borrowing_charge, platform_fee_percent, platform_fee, security_deposit, transaction_amount, late_fee_per_unit, late_units, late_fee, damage_deduction, deposit_refund, extra_due, owner_payout, pickup_location_id, dropoff_location_id, condition_before, condition_after, rating, review, created_at, updated_at) VALUES
(1, 1, 1, 2, 3, 'rated', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), 2, 'DAY', 700.00, 8.00, 56.00, 2000.00, 2756.00, 200.00, 0, 0.00, 0.00, 2000.00, 0.00, 700.00, 2, 2, '{"rating":5,"checklist":[0,1,2,3],"notes":"Sensor clean, both batteries at 100%."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"Returned in spotless condition."}', 5, 'Crisp 4K footage and Sneha included both fully charged batteries. Seamless handover at Media Lab.', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 2, 5, 1, 6, 'rated', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 1, 'DAY', 180.00, 8.00, 14.40, 1500.00, 1694.40, 120.00, 0, 0.00, 0.00, 1500.00, 0.00, 180.00, 6, 6, '{"rating":5,"checklist":[0,1,2,3],"notes":"Both 100MHz probes calibrated."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"All probes and clips intact."}', 5, 'Saved our project deadline when the lab oscilloscopes were locked over the weekend.', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(3, 3, 6, 3, 4, 'rated', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 2, 'DAY', 240.00, 8.00, 19.20, 1000.00, 1259.20, 80.00, 0, 0.00, 0.00, 1000.00, 0.00, 240.00, 1, 1, '{"rating":5,"checklist":[0,1,2,3],"notes":"Active cooler mounted, 27W PSU included."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"Returned on time at Central Library."}', 5, 'Pi 5 ran our benchmarks without thermal throttling. Great setup.', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 4, 15, 5, 1, 'rated', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 1, 'DAY', 160.00, 8.00, 12.80, 1000.00, 1172.80, 100.00, 0, 0.00, 0.00, 1000.00, 0.00, 160.00, 6, 6, '{"rating":5,"checklist":[0,1,2,3],"notes":"All 46 bits verified in case."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"Cleaned and all bits accounted for."}', 5, 'High torque drill, both batteries were charged and ready.', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 5, 12, 7, 3, 'rated', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 1, 'DAY', 140.00, 8.00, 11.20, 800.00, 951.20, 100.00, 0, 0.00, 0.00, 800.00, 0.00, 140.00, 4, 4, '{"rating":5,"checklist":[0,1,2,3],"notes":"Bat face clean, grip intact."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"No toe damage, returned clean."}', 5, 'Amazing ping on this bat. Helped us win the quarter-final!', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 6, 14, 6, 8, 'rated', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 'DAY', 90.00, 8.00, 7.20, 600.00, 697.20, 60.00, 0, 0.00, 0.00, 600.00, 0.00, 90.00, 6, 6, '{"rating":5,"checklist":[0,1,2,3],"notes":"Tip tinned, 65W charger included."}', '{"rating":5,"checklist":[0,1,2,3],"notes":"Tip clean, all accessories returned."}', 5, 'Heats up in seconds! Way better than regular hostel soldering irons.', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 8. Financial Ledger Transactions for Completed Exchanges
INSERT INTO transactions (exchange_id, type, amount, created_at) VALUES
(1, 'BORROWING_CHARGE', 700.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 'PLATFORM_FEE', 56.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 'DEPOSIT_HOLD', 2000.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 'DEPOSIT_REFUND', 2000.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1, 'OWNER_PAYOUT', 700.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 'BORROWING_CHARGE', 180.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 'PLATFORM_FEE', 14.40, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 'DEPOSIT_HOLD', 1500.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 'DEPOSIT_REFUND', 1500.00, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, 'OWNER_PAYOUT', 180.00, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(3, 'BORROWING_CHARGE', 240.00, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 'PLATFORM_FEE', 19.20, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 'DEPOSIT_HOLD', 1000.00, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 'DEPOSIT_REFUND', 1000.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 'OWNER_PAYOUT', 240.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'BORROWING_CHARGE', 160.00, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'PLATFORM_FEE', 12.80, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'DEPOSIT_HOLD', 1000.00, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(4, 'DEPOSIT_REFUND', 1000.00, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(4, 'OWNER_PAYOUT', 160.00, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 'BORROWING_CHARGE', 140.00, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 'PLATFORM_FEE', 11.20, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 'DEPOSIT_HOLD', 800.00, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 'DEPOSIT_REFUND', 800.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 'OWNER_PAYOUT', 140.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 'BORROWING_CHARGE', 90.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 'PLATFORM_FEE', 7.20, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 'DEPOSIT_HOLD', 600.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 'DEPOSIT_REFUND', 600.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'OWNER_PAYOUT', 90.00, DATE_SUB(NOW(), INTERVAL 2 DAY));
