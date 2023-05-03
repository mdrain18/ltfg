--------------------------------------------------------------
-- Filename:  V1.2__lookup_tables.sql
--------------------------------------------------------------

-- Create this table: LookupType
-- These tables represent a programmatic way of adding
--      different types of lookups using a single calling class
CREATE TABLE lookup_type
(
    id      SERIAL PRIMARY KEY,
    version INTEGER      NOT NULL,
    name    VARCHAR(256) NOT NULL,
    CONSTRAINT lookup_type_name_uniq UNIQUE (name) -- Each lookup type name must be unique
);
-- Teaching the team how to put a comment on a table and field so it shows up in the database's data dictionary export
COMMENT ON TABLE lookup_type IS 'This lookup_type table holds all of the lookup type names. Every lookup must have a type';
COMMENT ON COLUMN lookup_type.name IS 'Lookup_type.name holds the name or category of this lookup -- e.g., priority.';

-- Create this table: Lookup
CREATE TABLE lookup
(
    id            SERIAL PRIMARY KEY,
    version       INTEGER      NOT NULL,
    lookup_type   INTEGER      NOT NULL,
    name          VARCHAR(256) NOT NULL,
    display_order INTEGER      NULL,
    CONSTRAINT lookup_name_uniq UNIQUE (lookup_type, name),                           -- Each lookup name and type must be unique
    CONSTRAINT lookup_type_fkey FOREIGN KEY (lookup_type) REFERENCES lookup_type (id) -- Each lookup type must exist in the lookup_type table
);
COMMENT ON TABLE lookup IS 'The lookup table holds all of the lookup values';
COMMENT ON COLUMN lookup.name IS 'Lookup.name holds the actual lookup name -- low, medium, high';
COMMENT ON COLUMN lookup.display_order IS 'A possible order to display the lookups on the front-end';

-- Insert Starting Lookup Types
INSERT INTO lookup_type(id, version, name)
VALUES (100, 1, 'priority');
INSERT INTO lookup_type(id, version, name)
VALUES (101, 1, 'report_type');
INSERT INTO lookup_type(id, version, name)
VALUES (102, 1, 'author');
INSERT INTO lookup_type(id, version, name)
VALUES (103, 1, 'report_source');

-- Insert Starting Lookup Values for priority
INSERT INTO lookup(id, version, lookup_type, display_order, name)
VALUES (1, 1, 100, 1, 'low');
INSERT INTO lookup(id, version, lookup_type, display_order, name)
VALUES (2, 1, 100, 2, 'medium');
INSERT INTO lookup(id, version, lookup_type, display_order, name)
VALUES (3, 1, 100, 3, 'high');
INSERT INTO lookup(id, version, lookup_type, display_order, name)
VALUES (4, 1, 100, 4, 'critical');

-- Insert Starting Lookup Values for report_type
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (5, 1, 101, 'Marketing');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (6, 1, 101, 'H&R');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (7, 1, 101, 'CEO');

-- Insert Starting Lookup Values for author
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (2000, 1, 102, 'Adam');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (2001, 1, 102, 'Ben');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (2002, 1, 102, 'Peter');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (2003, 1, 102, 'Justin');
INSERT INTO lookup(id, version, lookup_type, name)
VALUES (2004, 1, 102, 'Josh');
insert into lookup(id, version, lookup_type, name)
values (2005, 1, 102, 'Suzanne');


-- Insert Starting Lookup Values for report_source
insert into lookup(id, version, lookup_type, name)
values (1000, 1, 103, 'Israel');
insert into lookup(id, version, lookup_type, name)
values (1001, 1, 103, 'United Kingdom');
insert into lookup(id, version, lookup_type, name)
values (1002, 1, 103, 'United States');



