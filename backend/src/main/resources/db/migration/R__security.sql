--------------------------------------------------------------------------------
-- Filename:  R__security.sql
--
-- NOTE:  This is a repeatable migration file because this data does not change
--        So, if anything changes in this file, this script is re-executed on startup
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS roles_uicontrols;
DROP TABLE IF EXISTS uicontrols;
DROP TABLE IF EXISTS roles;

-- Roles table
-- This table holds all of the application roles used by the web app
CREATE TABLE roles
(
    id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);

-- Uicontrols table
-- This table holds all of the ui control roles used by the web app
CREATE TABLE uicontrols
(
    id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);

-- Roles_uicontrols table
-- This table holds the relationships between the roles and uicontrols tables
CREATE TABLE roles_uicontrols
(
    role_id INTEGER NOT NULL,
    uicontrol_id INTEGER NOT NULL
);

----------------------------------------------------------------------------------
-- Define the security roles
insert into roles(id, name) values (1, 'ADMIN');
insert into roles(id, name) values( 2, 'READER');

-- Add the uicontrols records
insert into uicontrols(id, name) values(1001, 'page/viewReports');
insert into uicontrols(id, name) values(1002, 'page/reports/add');
insert into uicontrols(id, name) values(1003, 'page/reports/add2');
insert into uicontrols(id, name) values(1004, 'page/longReport');
insert into uicontrols(id, name) values(1005, 'page/searchResults');
insert into uicontrols(id, name) values(1006, 'page/dashboard');
insert into uicontrols(id, name) values(1007, 'page/usa-map');
insert into uicontrols(id, name) values(1008, 'page/chart-drill-down');
insert into uicontrols(id, name) values(1009, 'page/longview/');
insert into uicontrols(id, name) values(1010, 'page/longview');
insert into uicontrols(id, name) values(1011, 'page/page/reports/edit/');
insert into uicontrols(id, name) values(1012, 'page/search/details/');
insert into uicontrols(id, name) values(1013, 'page/report/upload');
insert into uicontrols(id, name) values(1014, 'page/chart1');
insert into uicontrols(id, name) values(1015, 'page/chart2');
insert into uicontrols(id, name) values(1016, 'page/reports/grid');
insert into uicontrols(id, name) values(1017, 'page/reports/markdown-submit');
insert into uicontrols(id, name) values(1018, 'page/reports/pdf-viewer');
insert into uicontrols(id, name) values(1019, 'page/reports/tab-group');
insert into uicontrols(id, name) values(1020, 'page/reports/search');
insert into uicontrols(id, name) values(1021, 'page/dashboard/layout');
insert into uicontrols(id, name) values(1022, 'page/dashboard/grid');
insert into uicontrols(id, name) values(1023, 'page/dashboard/bar_chart');
insert into uicontrols(id, name) values(1024, 'page/dashboard/map');
insert into uicontrols(id, name) values(1025, 'page/reports/grid-tab-group/:startingTab');
insert into uicontrols(id, name) values(1026, 'page/reports/edit-details/:id');
insert into uicontrols(id, name) values(1027, 'page/reports/characters');
insert into uicontrols(id, name) values(1028, 'page/reports/clans');
insert into uicontrols(id, name) values(1029, 'page/reports/buildings');
insert into uicontrols(id, name) values(1030, 'page/reports/inventory');
insert into uicontrols(id, name) values(1031, 'page/reports/inventory');


-- Assign ui controls for the 'admin' role
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1001);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1002);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1003);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1004);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1005);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1006);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1007);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1008);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1009);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1010);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1011);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1012);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1013);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1014);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1015);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1016);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1017);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1018);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1019);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1020);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1021);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1022);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1023);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1024);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1025);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1026);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1027);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1028);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1029);
insert into roles_uicontrols(role_id, uicontrol_id) values(1, 1030);


-- Assign ui controls for the 'reader' role  (cannot get to addReport)
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1001);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1002);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1003);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1004);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1005);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1006);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1007);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1008);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1009);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1010);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1011);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1012);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1013);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1014);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1015);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1016);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1017);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1018);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1019);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1020);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1021);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1022);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1023);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1024);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1025);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1026);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1027);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1028);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1029);
insert into roles_uicontrols(role_id, uicontrol_id) values(2, 1030);
