--------------------------------------------------------------
-- Filename:  V1.6__game_metrics.sql
--------------------------------------------------------------

-- Deaths table
-- Stores information about character deaths in a game
CREATE TABLE deaths
(
    death_id       SERIAL PRIMARY KEY,
    character_id   INTEGER   NOT NULL REFERENCES ltfg.characters (character_id),
    causer_char_id INTEGER   NOT NULL REFERENCES ltfg.characters (character_id),
    x              FLOAT     NOT NULL,
    y              FLOAT     NOT NULL,
    z              FLOAT     NOT NULL,
    died_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Safe_Areas table
-- Stores information about the designated safe areas in the game
--      I.E. where people cannot be killed
CREATE TABLE safe_area
(
    safe_area_id SERIAL PRIMARY KEY,
    game_id      INTEGER REFERENCES ltfg.games (game_id),
    x            FLOAT NOT NULL,
    y            FLOAT NOT NULL,
    z            FLOAT NOT NULL,
    radius       FLOAT DEFAULT 1
);

-- Bans table
-- Summary: Stores information about bans issued to characters in a game
CREATE TABLE exiled_bans
(
    ban_id          SERIAL PRIMARY KEY,
    character_id    INTEGER   NOT NULL REFERENCES ltfg.characters (character_id),
    platformId      CHAR(100) NOT NULL UNIQUE,
    steamPlatformId CHAR(100) NOT NULL,
    banTime         TIMESTAMP NOT NULL,
    banEndTime      TIMESTAMP NOT NULL,
    banReason       CHAR(100) NOT NULL,
    banIssued       SMALLINT  NOT NULL,
    CONSTRAINT platformid_unique UNIQUE (platformid)
);

