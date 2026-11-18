-- Minimal DDL mirroring the tables the webhook writes to (with this change applied).
CREATE TABLE users(id text PRIMARY KEY,credits int NOT NULL DEFAULT 10);
CREATE TABLE credit_grants(stripe_session_id text PRIMARY KEY);
