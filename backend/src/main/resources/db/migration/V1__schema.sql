CREATE TABLE locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
  lat DOUBLE NOT NULL, lng DOUBLE NOT NULL
);
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE
);
-- item_types drive need-based discovery & bundles ("camera", "tripod", ...)
CREATE TABLE item_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, category_id BIGINT NOT NULL,
  name VARCHAR(80) NOT NULL UNIQUE, keywords TEXT NOT NULL,  -- comma-separated synonyms
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
-- need templates: phrase keywords -> required item types
CREATE TABLE need_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
  trigger_keywords TEXT NOT NULL,
  required_item_types JSON NOT NULL,   -- ["camera","tripod"]
  optional_item_types JSON NULL
);
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
  department VARCHAR(120) NOT NULL, study_year VARCHAR(20) NOT NULL,
  verification_status ENUM('pending','verified','suspended') NOT NULL DEFAULT 'verified',
  suspended_reason VARCHAR(255) NULL,
  location_id BIGINT NULL, bio VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
CREATE TABLE posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, owner_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL, item_type_id BIGINT NULL,
  title VARCHAR(150) NOT NULL, item_name VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  item_condition ENUM('new','like_new','good','fair') NOT NULL DEFAULT 'good',
  accessories JSON NOT NULL,                 -- ["charger","18-55mm lens"]
  borrowing_conditions TEXT NULL,
  rate_unit ENUM('HOUR','DAY') NOT NULL DEFAULT 'DAY',
  rate DECIMAL(10,2) NOT NULL, min_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
  security_deposit DECIMAL(10,2) NOT NULL,
  late_fee_per_unit DECIMAL(10,2) NOT NULL,  -- per overdue rate_unit
  max_duration_units INT NOT NULL DEFAULT 7,
  retail_value DECIMAL(10,2) NOT NULL DEFAULT 0,   -- for "money saved"
  location_id BIGINT NOT NULL, pickup_note VARCHAR(255) NULL,
  approval_status ENUM('pending_approval','approved','rejected') NOT NULL DEFAULT 'pending_approval',
  rejection_reason VARCHAR(255) NULL,
  availability ENUM('available','reserved','lent') NOT NULL DEFAULT 'available',
  flagged BOOLEAN NOT NULL DEFAULT FALSE, flag_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (item_type_id) REFERENCES item_types(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_posts_listing (approval_status, availability, category_id)
);
CREATE TABLE requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, post_id BIGINT NOT NULL, borrower_id BIGINT NOT NULL,
  status ENUM('pending','accepted','rejected','cancelled','closed_auto') NOT NULL DEFAULT 'pending',
  start_at DATETIME(3) NOT NULL, end_at DATETIME(3) NOT NULL, units INT NOT NULL,
  message VARCHAR(500) NULL,
  agreement_snapshot JSON NOT NULL,          -- exact text/figures the borrower confirmed
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (borrower_id) REFERENCES users(id),
  INDEX idx_req_post (post_id), INDEX idx_req_borrower (borrower_id)
);
CREATE TABLE exchanges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, request_id BIGINT NOT NULL UNIQUE,
  post_id BIGINT NOT NULL, owner_id BIGINT NOT NULL, borrower_id BIGINT NOT NULL,
  state ENUM('payment_pending','handover','borrowed','returned','inspected','settled','rated','cancelled')
        NOT NULL DEFAULT 'payment_pending',
  start_at DATETIME(3) NOT NULL, due_at DATETIME(3) NOT NULL,
  handed_over_at DATETIME(3) NULL, returned_at DATETIME(3) NULL,
  units INT NOT NULL, rate_unit ENUM('HOUR','DAY') NOT NULL,
  borrowing_charge DECIMAL(10,2) NOT NULL,
  platform_fee_percent DECIMAL(5,2) NOT NULL, platform_fee DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL, transaction_amount DECIMAL(10,2) NOT NULL,
  late_fee_per_unit DECIMAL(10,2) NOT NULL,
  late_units INT NOT NULL DEFAULT 0, late_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  damage_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_refund DECIMAL(10,2) NULL, extra_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  owner_payout DECIMAL(10,2) NULL,
  pickup_location_id BIGINT NOT NULL, dropoff_location_id BIGINT NULL,
  condition_before JSON NULL, condition_after JSON NULL,   -- {rating,checklist:[{label,ok}],notes}
  damage_claim JSON NULL,                                  -- {amount,notes,status:pending|accepted|contested}
  rating TINYINT NULL, review VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id), FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (owner_id) REFERENCES users(id), FOREIGN KEY (borrower_id) REFERENCES users(id),
  FOREIGN KEY (pickup_location_id) REFERENCES locations(id),
  FOREIGN KEY (dropoff_location_id) REFERENCES locations(id),
  INDEX idx_ex_state_due (state, due_at)
);
CREATE TABLE exchange_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, exchange_id BIGINT NOT NULL, state VARCHAR(30) NOT NULL,
  actor_id BIGINT NULL, note VARCHAR(255) NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (exchange_id) REFERENCES exchanges(id), INDEX idx_ev_ex (exchange_id)
);
CREATE TABLE transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, exchange_id BIGINT NOT NULL,
  type ENUM('BORROWING_CHARGE','PLATFORM_FEE','DEPOSIT_HOLD','DEPOSIT_REFUND',
            'LATE_FEE','DAMAGE_DEDUCTION','EXTRA_CHARGE','OWNER_PAYOUT') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (exchange_id) REFERENCES exchanges(id), INDEX idx_tx_ex (exchange_id)
);
CREATE TABLE disputes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, exchange_id BIGINT NOT NULL, raised_by BIGINT NOT NULL,
  kind ENUM('damage','loss','other') NOT NULL DEFAULT 'damage',
  reason TEXT NOT NULL, claimed_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('open','under_review','resolved') NOT NULL DEFAULT 'open',
  resolution ENUM('favor_owner','favor_borrower','split') NULL,
  final_deduction DECIMAL(10,2) NULL, admin_note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP NULL,
  FOREIGN KEY (exchange_id) REFERENCES exchanges(id), FOREIGN KEY (raised_by) REFERENCES users(id),
  INDEX idx_disp_status (status)
);
CREATE TABLE photos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, uploader_id BIGINT NOT NULL,
  purpose ENUM('LISTING','CONDITION_BEFORE','CONDITION_AFTER','EVIDENCE','AVATAR') NOT NULL,
  post_id BIGINT NULL, exchange_id BIGINT NULL, dispute_id BIGINT NULL,
  stored_name VARCHAR(80) NOT NULL, mime VARCHAR(40) NOT NULL, size_bytes INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id),
  INDEX idx_ph_post (post_id), INDEX idx_ph_ex (exchange_id), INDEX idx_ph_disp (dispute_id)
);
CREATE TABLE demand_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY, requester_id BIGINT NOT NULL, category_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL, description VARCHAR(500) NULL,
  status ENUM('open','fulfilled','closed') NOT NULL DEFAULT 'open',
  fulfilled_by_post_id BIGINT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id), FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE TABLE settings (
  `key` VARCHAR(60) PRIMARY KEY, `value` VARCHAR(255) NOT NULL
);
