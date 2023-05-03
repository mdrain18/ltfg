--------------------------------------------------------------
-- Filename:  V1.3__reports.sql
--------------------------------------------------------------

-- Create this table: reports
-- Admin reports table: future development
DROP TABLE IF EXISTS reports;
CREATE TABLE reports
(
    id         SERIAL PRIMARY KEY,
    version    INTEGER      NOT NULL,
    name       VARCHAR(256) NOT NULL,
    priority   INTEGER      NULL,
    start_date TIMESTAMP    NULL,
    end_date   TIMESTAMP    NULL,
    CONSTRAINT lookup_priority FOREIGN KEY (priority) REFERENCES ltfg.lookup (id)
);
