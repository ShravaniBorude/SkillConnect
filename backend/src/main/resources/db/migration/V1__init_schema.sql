-- SkillConnect Normalized Schema (MySQL 8 & H2 MySQL-mode compatible)

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(30),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP NULL,
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP NULL,
    account_status VARCHAR(40) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
);
CREATE INDEX idx_users_role ON users (role_id);
CREATE INDEX idx_users_status ON users (account_status);
CREATE INDEX idx_users_verif_token ON users (verification_token);
CREATE INDEX idx_users_reset_token ON users (reset_token);

CREATE TABLE freelancer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    headline VARCHAR(200),
    bio TEXT,
    hourly_rate DECIMAL(12, 2) DEFAULT 0.00,
    experience_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    years_of_experience INT DEFAULT 0,
    education TEXT,
    experience_summary TEXT,
    location VARCHAR(120),
    languages VARCHAR(255),
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_reviews INT NOT NULL DEFAULT 0,
    total_earnings DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    completed_projects_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_fp_availability ON freelancer_profiles (availability_status);
CREATE INDEX idx_fp_verification ON freelancer_profiles (verification_status);
CREATE INDEX idx_fp_rating ON freelancer_profiles (average_rating);

CREATE TABLE client_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150),
    industry VARCHAR(120),
    website VARCHAR(255),
    bio TEXT,
    location VARCHAR(120),
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_reviews INT NOT NULL DEFAULT 0,
    total_spent DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    projects_posted_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category_hint VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE freelancer_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    freelancer_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    years_used INT DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_freelancer_skill UNIQUE (freelancer_profile_id, skill_id),
    CONSTRAINT fk_fs_profile FOREIGN KEY (freelancer_profile_id) REFERENCES freelancer_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_fs_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
);

CREATE TABLE portfolio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    freelancer_profile_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    project_url VARCHAR(500),
    image_url VARCHAR(500),
    attachment_url VARCHAR(500),
    technologies_used VARCHAR(400),
    completion_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_fp FOREIGN KEY (freelancer_profile_id) REFERENCES freelancer_profiles (id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_fp ON portfolio (freelancer_profile_id);

CREATE TABLE project_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(80),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget_type VARCHAR(30) NOT NULL DEFAULT 'FIXED',
    budget_min DECIMAL(12, 2) NOT NULL,
    budget_max DECIMAL(12, 2) NOT NULL,
    experience_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    proposal_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES users (id),
    CONSTRAINT fk_projects_category FOREIGN KEY (category_id) REFERENCES project_categories (id)
);
CREATE INDEX idx_projects_client ON projects (client_id);
CREATE INDEX idx_projects_category ON projects (category_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_exp ON projects (experience_level);
CREATE INDEX idx_projects_created ON projects (created_at);

CREATE TABLE project_skills (
    project_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, skill_id),
    CONSTRAINT fk_ps_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
);

CREATE TABLE project_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pa_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE INDEX idx_pa_project ON project_attachments (project_id);

CREATE TABLE proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_budget DECIMAL(12, 2) NOT NULL,
    estimated_days INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    negotiation_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_proposal_project_freelancer UNIQUE (project_id, freelancer_id),
    CONSTRAINT fk_prop_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_prop_freelancer FOREIGN KEY (freelancer_id) REFERENCES users (id)
);
CREATE INDEX idx_prop_project ON proposals (project_id);
CREATE INDEX idx_prop_freelancer ON proposals (freelancer_id);
CREATE INDEX idx_prop_status ON proposals (status);

CREATE TABLE contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    proposal_id BIGINT NOT NULL UNIQUE,
    client_id BIGINT NOT NULL,
    freelancer_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    terms TEXT NOT NULL,
    agreed_amount DECIMAL(12, 2) NOT NULL,
    platform_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    start_date DATE,
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    client_signed_at TIMESTAMP NULL,
    freelancer_signed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contracts_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_contracts_proposal FOREIGN KEY (proposal_id) REFERENCES proposals (id),
    CONSTRAINT fk_contracts_client FOREIGN KEY (client_id) REFERENCES users (id),
    CONSTRAINT fk_contracts_freelancer FOREIGN KEY (freelancer_id) REFERENCES users (id)
);
CREATE INDEX idx_contracts_client ON contracts (client_id);
CREATE INDEX idx_contracts_freelancer ON contracts (freelancer_id);
CREATE INDEX idx_contracts_status ON contracts (status);

CREATE TABLE milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE,
    sequence_order INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_milestones_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);
CREATE INDEX idx_milestones_contract ON milestones (contract_id);

CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NULL,
    project_id BIGINT NULL,
    participant_one_id BIGINT NOT NULL,
    participant_two_id BIGINT NOT NULL,
    last_message_at TIMESTAMP NULL,
    last_message_preview VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conv_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE SET NULL,
    CONSTRAINT fk_conv_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
    CONSTRAINT fk_conv_p1 FOREIGN KEY (participant_one_id) REFERENCES users (id),
    CONSTRAINT fk_conv_p2 FOREIGN KEY (participant_two_id) REFERENCES users (id)
);
CREATE INDEX idx_conv_p1 ON conversations (participant_one_id);
CREATE INDEX idx_conv_p2 ON conversations (participant_two_id);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    message_type VARCHAR(30) NOT NULL DEFAULT 'TEXT',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);
CREATE INDEX idx_msg_conv_created ON messages (conversation_id, created_at);

CREATE TABLE work_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    milestone_id BIGINT NULL,
    freelancer_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    deliverable_url VARCHAR(500) NOT NULL,
    deliverable_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    revision_feedback TEXT,
    revision_number INT NOT NULL DEFAULT 1,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ws_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_ws_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT fk_ws_freelancer FOREIGN KEY (freelancer_id) REFERENCES users (id)
);
CREATE INDEX idx_ws_contract ON work_submissions (contract_id);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_review_contract_reviewer UNIQUE (contract_id, reviewer_id),
    CONSTRAINT fk_rev_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
    CONSTRAINT fk_rev_reviewee FOREIGN KEY (reviewee_id) REFERENCES users (id)
);
CREATE INDEX idx_rev_reviewee ON reviews (reviewee_id);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    milestone_id BIGINT NULL,
    payer_id BIGINT NOT NULL,
    payee_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) NOT NULL,
    net_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    razorpay_order_id VARCHAR(120) UNIQUE,
    razorpay_payment_id VARCHAR(120) UNIQUE,
    razorpay_signature VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    failure_reason VARCHAR(500),
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_contract FOREIGN KEY (contract_id) REFERENCES contracts (id),
    CONSTRAINT fk_pay_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT fk_pay_payer FOREIGN KEY (payer_id) REFERENCES users (id),
    CONSTRAINT fk_pay_payee FOREIGN KEY (payee_id) REFERENCES users (id)
);
CREATE INDEX idx_pay_payer ON payments (payer_id);
CREATE INDEX idx_pay_payee ON payments (payee_id);
CREATE INDEX idx_pay_status ON payments (status);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    transaction_type VARCHAR(40) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    reference_code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE SET NULL,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE INDEX idx_tx_user ON transactions (user_id);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message VARCHAR(600) NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_notif_user_read ON notifications (user_id, is_read);

CREATE TABLE disputes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    raised_by_id BIGINT NOT NULL,
    against_user_id BIGINT NOT NULL,
    reason VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    evidence_url VARCHAR(500),
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    resolved_by_id BIGINT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disp_contract FOREIGN KEY (contract_id) REFERENCES contracts (id),
    CONSTRAINT fk_disp_raised_by FOREIGN KEY (raised_by_id) REFERENCES users (id),
    CONSTRAINT fk_disp_against FOREIGN KEY (against_user_id) REFERENCES users (id),
    CONSTRAINT fk_disp_resolved_by FOREIGN KEY (resolved_by_id) REFERENCES users (id)
);
CREATE INDEX idx_disp_status ON disputes (status);

CREATE TABLE verification_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    freelancer_profile_id BIGINT NOT NULL,
    document_type VARCHAR(40) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    document_number_masked VARCHAR(80),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_by_id BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vd_fp FOREIGN KEY (freelancer_profile_id) REFERENCES freelancer_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_vd_reviewer FOREIGN KEY (reviewed_by_id) REFERENCES users (id)
);
CREATE INDEX idx_vd_status ON verification_documents (status);

CREATE TABLE reported_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    reason VARCHAR(200) NOT NULL,
    details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    reviewed_by_id BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ru_reporter FOREIGN KEY (reporter_id) REFERENCES users (id),
    CONSTRAINT fk_ru_reported FOREIGN KEY (reported_user_id) REFERENCES users (id),
    CONSTRAINT fk_ru_reviewer FOREIGN KEY (reviewed_by_id) REFERENCES users (id)
);
