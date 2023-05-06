--------------------------------------------------------------
-- Filename:  V1.5__clans_characters.sql
--------------------------------------------------------------

-- Game table
-- Stores information about a game managed by a user
CREATE TABLE games
(
    game_id       SERIAL PRIMARY KEY,
    user_id       INTEGER     NOT NULL REFERENCES ltfg.users (id),
    game_name     VARCHAR(50) NOT NULL,
    game_platform VARCHAR(50) NOT NULL,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

INSERT INTO games (user_id, game_name, game_platform)
VALUES (1, 'Conan Exiles', 'PC');

-- Clan metrics table
-- Stores various metrics for a clan, including member counts, growth rate, trophy count,
-- donation count and rate, war wins and losses, win rate, placed building count,
-- inventory count, stored building count, and KD ratio
CREATE TABLE clan_metrics
(
    clan_id               SERIAL PRIMARY KEY,
    clan_name             VARCHAR(50),
    message_of_the_day    VARCHAR(256),
    owner_id              INTEGER,
    total_members         INTEGER            DEFAULT 1,
    active_members        INTEGER            DEFAULT 0,
    member_growth_rate    FLOAT,
    war_wins              INTEGER            DEFAULT 0,
    war_losses            INTEGER            DEFAULT 0,
    placed_building_count INTEGER            DEFAULT 0,
    inventory_count       INTEGER            DEFAULT 0,
    stored_building_count INTEGER            DEFAULT 0,
    clan_kd_ratio         FLOAT,
    last_updated          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- characters table
CREATE TABLE characters
(
    character_id    SERIAL PRIMARY KEY,
    char_game_id    INTEGER     NOT NULL UNIQUE,
    character_name  VARCHAR(50),
    platformId      VARCHAR(20) NOT NULL,
    level           INTEGER              DEFAULT 1,
    game_id         INTEGER REFERENCES games (game_id),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    clan_id         INTEGER REFERENCES clan_metrics (clan_id),
    is_admin        BOOLEAN     NOT NULL DEFAULT FALSE,
    last_login_date TIMESTAMP,
    time_played     INTEGER              DEFAULT 0,
    is_new          BOOLEAN     NOT NULL DEFAULT FALSE
);

-------------------------------------------------------------------------------------------------
-- Function to update the total_members count in the clan_metrics table
CREATE OR REPLACE FUNCTION ltfg.update_total_members_count()
    RETURNS TRIGGER AS
$$
BEGIN
    -- Increment total_members count in the clan_metrics table for the inserted character's clan
    UPDATE ltfg.clan_metrics
    SET total_members = total_members + 1
    WHERE clan_id = NEW.clan_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update_total_members_count function after inserting a new character
CREATE TRIGGER update_total_members_count_trigger
    AFTER INSERT
    ON ltfg.characters
    FOR EACH ROW
EXECUTE FUNCTION ltfg.update_total_members_count();

-- This function updates the active_members count in the clan_metrics table for a given clan_id.
-- It calculates the number of active members based on the last_login_date in the characters table.
-- A member is considered "active" if they have logged in within the past 7 days.
CREATE OR REPLACE FUNCTION ltfg.update_active_members(p_clan_id INTEGER)
    RETURNS VOID AS $$
BEGIN
    UPDATE clan_metrics
    SET active_members = (
        SELECT COUNT(*)
        FROM characters
        WHERE clan_id = p_clan_id
          AND last_login_date >= NOW() - INTERVAL '7 days'
    )
    WHERE clan_id = p_clan_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to call update_active_members when last_login_date is updated
CREATE OR REPLACE FUNCTION update_active_members_trigger()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_login_date <> OLD.last_login_date THEN
        PERFORM ltfg.update_active_members(NEW.clan_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the characters table
CREATE TRIGGER update_active_members_on_login
    AFTER UPDATE OF last_login_date ON characters
    FOR EACH ROW
EXECUTE FUNCTION ltfg.update_active_members_trigger();

-- Function to update the is_new field in the characters table
CREATE OR REPLACE FUNCTION update_is_new()
    RETURNS TRIGGER AS
$$
DECLARE
    new_period INTERVAL := INTERVAL '8 days';
BEGIN
    -- If the created_at timestamp of the updated character is within the past 8 days
    IF (NEW.created_at >= NOW() - new_period) THEN
        -- Set is_new to TRUE for the character
        NEW.is_new := TRUE;
    ELSE
        -- Set is_new to FALSE for the character
        NEW.is_new := FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update_is_new function after inserting or updating a character's created_at
CREATE TRIGGER update_is_new_trigger
    AFTER INSERT OR UPDATE OF created_at
    ON ltfg.characters
    FOR EACH ROW
EXECUTE FUNCTION ltfg.update_is_new();

