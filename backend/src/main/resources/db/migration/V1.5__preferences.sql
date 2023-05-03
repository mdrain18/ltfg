--------------------------------------------------------------
-- Filename:  V1.5__preferences.sql
--------------------------------------------------------------

-- Create the preferences table
CREATE TABLE preferences
(
    id          SERIAL PRIMARY KEY,
    userid      INTEGER NOT NULL,
    show_banner BOOLEAN
);
