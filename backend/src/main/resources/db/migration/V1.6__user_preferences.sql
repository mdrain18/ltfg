--------------------------------------------------------------
-- Filename:  V1.6__user_preferences.sql
--------------------------------------------------------------

-- Users table
-- A table which stores all the user information
CREATE TABLE users
(
    id              SERIAL PRIMARY KEY,
    version         INTEGER      NOT NULL DEFAULT (1),
    email           VARCHAR(255),
    account_created TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login_date TIMESTAMP    DEFAULT now(),
    full_name       VARCHAR(200) NULL,
    user_name       VARCHAR(100) NOT NULL,
    password        VARCHAR(255),
    is_locked       BOOLEAN      DEFAULT false,
    unique (user_name)
);
comment on table users is 'The Users table holds information about each registered user';

INSERT INTO users (email, full_name, user_name, password)
VALUES
    ('admin@ltfg.com', 'admin', 'admin', '1234asdf'),
    ('jane.doe@example.com', 'Jane Doe', 'janedoe', 'password123'),
    ('john.smith@example.com', 'John Smith', 'johnsmith', 'password456'),
    ('lisa.wang@example.com', 'Lisa Wang', 'lisawang', 'password789'),
    ('mike.jones@example.com', 'Mike Jones', 'mikejones', 'password321'),
    ('sarah.kim@example.com', 'Sarah Kim', 'sarahkim', 'password654'),
    ('tom.brown@example.com', 'Tom Brown', 'tombrown', 'password987'),
    ('amy.nguyen@example.com', 'Amy Nguyen', 'amynguyen', 'password654'),
    ('ben.wilson@example.com', 'Ben Wilson', 'benwilson', 'password321'),
    ('chris.taylor@example.com', 'Chris Taylor', 'christaylor', 'password789'),
    ('david.chen@example.com', 'David Chen', 'davidchen', 'password123'),
    ('emily.young@example.com', 'Emily Young', 'emilyyoung', 'password456'),
    ('fred.wu@example.com', 'Fred Wu', 'fredwu', 'password987'),
    ('grace.lee@example.com', 'Grace Lee', 'gracelee', 'password321'),
    ('hannah.baker@example.com', 'Hannah Baker', 'hannahbaker', 'password654'),
    ('jason.lin@example.com', 'Jason Lin', 'jasonlin', 'password123'),
    ('kate.jackson@example.com', 'Kate Jackson', 'katejackson', 'password456'),
    ('larry.kim@example.com', 'Larry Kim', 'larrykim', 'password789'),
    ('mia.garcia@example.com', 'Mia Garcia', 'miagarcia', 'password321'),
    ('nick.davis@example.com', 'Nick Davis', 'nickdavis', 'password987');

-- user_preferences table
-- A table which stores all the user preferences like light/dark mode
-- NOTE:  This table does not have a unique ID.  Instead the userid, page, name is unique
CREATE TABLE user_preferences
(
    userid INTEGER     NOT NULL,
    page   VARCHAR     NULL,
    name   VARCHAR(50) NOT NULL,
    value  TEXT        NOT NULL,
    constraint userpreferences_userid FOREIGN KEY (userid) references users (id),
    unique (userid, page, name)
);
comment on table user_preferences is 'The user_preferences table holds preferences for each user';

-- Tiers table
-- A lookup table for the different subscription tiers
CREATE TABLE tiers
(
    tier_id     SERIAL PRIMARY KEY,
    name        VARCHAR(50)    NOT NULL,
    description TEXT           NOT NULL,
    price       DECIMAL(10, 2) NOT NULL
);

INSERT INTO tiers (name, description, price)
VALUES ('Basic', 'Basic subscription', 5.00);
INSERT INTO tiers (name, description, price)
VALUES ('Standard', 'Standard subscription', 10.00);
INSERT INTO tiers (name, description, price)
VALUES ('Premium', 'Premium subscription', 20.00);

-- Subscriptions table
-- Has a user_id (fk to users table), the subscription tier (which are 3 different tiers),
-- date subscribed, gifted boolean field, patreon boolean field, last paid field
CREATE TABLE subscriptions
(
    subscription_id SERIAL PRIMARY KEY,
    user_id         INTEGER   NOT NULL REFERENCES users (id),
    tier            INTEGER   NOT NULL REFERENCES tiers (tier_id),
    subscribed_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    is_gifted       BOOLEAN   NOT NULL DEFAULT FALSE,
    is_patreon      BOOLEAN   NOT NULL DEFAULT FALSE,
    last_paid       TIMESTAMP
);

-- Payments table
-- Stores information about user payments
CREATE TABLE payments
(
    payment_id SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL REFERENCES users (id),
    paid_at    TIMESTAMP NOT NULL DEFAULT NOW()
);