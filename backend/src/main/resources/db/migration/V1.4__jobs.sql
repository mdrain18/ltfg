--------------------------------------------------------------
-- Filename:  V1.4__jobs.sql
--------------------------------------------------------------

-- Create the jobs table
CREATE TABLE jobs
(
    id                  SERIAL PRIMARY KEY,
    state               INTEGER NOT NULL,
    progress_as_percent INTEGER,
    submitter_username  VARCHAR(100),
    submitter_date      TIMESTAMP DEFAULT now(),
    original_filename   VARCHAR(100),
    user_message        VARCHAR(2000)
);
