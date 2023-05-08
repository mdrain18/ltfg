package com.lessons.services;

import com.lessons.models.*;
import com.lessons.utilities.PasswordEncrypter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("com.lessons.services.ReportService")
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Resource
    private DataSource dataSource;

    @Resource
    private DatabaseService databaseService;

    /**
     * Attempt to add a report record to the database
     *
     * @param addReportDTO Pass-in model object that holds all the report fields
     */
    public void addReport(AddReportDTO addReportDTO) {
        logger.debug("addReport() started.");

        String sql = "insert into ltfg.reports(id, version, name, priority, start_date, end_date) " +
                "values(:id, :version, :name, :priority, :start_date, :end_date)";

        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("id", databaseService.getNextId());
        paramMap.put("version", databaseService.getStartingVersionValue());
        paramMap.put("name", addReportDTO.getName());
        paramMap.put("priority", addReportDTO.getPriority());
        paramMap.put("start_date", addReportDTO.getStartDate());
        paramMap.put("end_date", addReportDTO.getEndDate());

        NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(this.dataSource);

        // Execute the SQL
        int rowsCreated = np.update(sql, paramMap);

        if (rowsCreated != 1) {
            throw new RuntimeException("Critical error in addReport():  I expected to create one database record, but did not.");
        }

        logger.debug("addReport() finished.");
    }


    /**
     * Attempt to add a report record to the database
     *
     * @param newUser Pass-in model object that holds all the report fields
     */
    public void addUser(RegisterUser newUser) throws NoSuchAlgorithmException {
        logger.debug("addReport() started.");

        String sql = "INSERT INTO ltfg.users (email, full_name, user_name, password) VALUES (:email, :fullName, :userName, :password)";

        // Create the full name from the first and last
        String fullName = newUser.getFirstName() + " " + newUser.getLastName();
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("email", newUser.getEmail());
        paramMap.put("fullName", fullName);
        paramMap.put("userName", newUser.getUserName());
        paramMap.put("password", PasswordEncrypter.hashPassword(newUser.getPassword()));

        NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(this.dataSource);

        // Execute the SQL
        int rowsCreated = np.update(sql, paramMap);

        if (rowsCreated != 1) {
            throw new RuntimeException("Critical error in addUser():  I expected to create one database record, but did not.");
        }

        logger.debug("addUser() finished.");
    }


    /**
     * @return a List of all Users (as a list of GetAllUsersDTO objects)
     */
    public Boolean validateLogin(ValidateUsersDTO validateUser) throws NoSuchAlgorithmException {
        logger.debug("validateLogin() started.");

        String sql = "SELECT password FROM ltfg.users\n" +
                "WHERE user_name = ?;";

        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        SqlRowSet rs = jt.queryForRowSet(sql, validateUser.getUsername());
        if (rs.next()) {
            // I found the record in the database, now we check the password
            boolean isMatch = PasswordEncrypter.comparePasswords(validateUser.getPassword(), rs.getString("password"));
            return isMatch;
        } else {
            // I did not find this username in the database.
            return false;
        }
    }


    /**
     * @return a List of all Users (as a list of GetAllUsersDTO objects)
     */
    public List<GetAllUsersDTO> getAllUsers() {
        logger.debug("getAllUsers() started.");
        // Construct the SQL to get all users
        String sql = "SELECT\n" +
                "    id AS id, version AS version, email AS email, account_created AS accountCreated,\n" +
                "    last_login_date AS lastLoginDate, full_name AS fullName, user_name AS userName,\n" +
                "    password AS password, is_locked AS isLocked\n" +
                "FROM\n" +
                "    ltfg.users";

        // Use the rowMapper to convert the results into a list of GetAllUsersDTO objects
        BeanPropertyRowMapper<GetAllUsersDTO> rowMapper = new BeanPropertyRowMapper<>(GetAllUsersDTO.class);

        // Execute the SQL and Convert the results into a list of GetAllUsersDTO objects
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        List<GetAllUsersDTO> listOfUsers = jt.query(sql, rowMapper);

        // Return the list of GetAllUsersDTO objects
        return listOfUsers;
    }


    /**
     * @return a List of all Characters (as a list of GetCharactersDTO objects)
     */
    public List<GetCharactersDTO> getAllCharacters() {
        logger.debug("getAllCharacters() started.");
        // Construct the SQL to get all characters
        String sql = "SELECT\n" +
                "    c.character_id as id, c.platformId, c.character_name as characterName, c.level,\n" +
                "    c.created_at as createdAt, c.last_login_date as lastLoginDate, cm.clan_name as clanName, " +
                "    g.game_name as gameName, c.time_played as timePlayed, c.is_new as isNew\n" +
                "FROM\n" +
                "    ltfg.characters c\n" +
                "JOIN\n" +
                "    ltfg.clan_metrics cm ON c.clan_id = cm.clan_id\n" +
                "JOIN\n" +
                "    ltfg.games g ON c.game_id = g.game_id;\n";

        // Use the rowMapper to convert the results into a list of GetCharactersDTO objects
        BeanPropertyRowMapper<GetCharactersDTO> rowMapper = new BeanPropertyRowMapper<>(GetCharactersDTO.class);

        // Execute the SQL and Convert the results into a list of GetCharactersDTO objects
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        List<GetCharactersDTO> listOfCharacters = jt.query(sql, rowMapper);

        // Return the list of GetCharactersDTO objects
        return listOfCharacters;
    }


    /**
     * @return a List of all Characters (as a list of GetClansDTO objects)
     */
    public List<GetClansDTO> getAllClans() {
        logger.debug("getAllClans() started.");
        // Construct the SQL to get all characters
        String sql = "SELECT \n" +
                "    clan_id AS id,\n" +
                "    clan_name AS clanName,\n" +
                "    message_of_the_day AS messageOfTheDay,\n" +
                "    owner_id AS ownerId,\n" +
                "    total_members AS totalMembers,\n" +
                "    active_members AS activeMembers,\n" +
                "    member_growth_rate AS memberGrowthRate,\n" +
                "    war_wins AS warWins,\n" +
                "    war_losses AS warLosses,\n" +
                "    placed_building_count AS placedBuildingCount,\n" +
                "    inventory_count AS inventoryCount,\n" +
                "    stored_building_count AS storedBuildingCount,\n" +
                "    clan_kd_ratio AS clanKDRatio,\n" +
                "    last_updated AS lastUpdated\n" +
                "FROM \n" +
                "    ltfg.clan_metrics;";

        // Use the rowMapper to convert the results into a list of GetClansDTO objects
        BeanPropertyRowMapper<GetClansDTO> rowMapper = new BeanPropertyRowMapper<>(GetClansDTO.class);

        // Execute the SQL and Convert the results into a list of GetReportDTO objects
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        List<GetClansDTO> listOfClans = jt.query(sql, rowMapper);

        // Return the list of GetReportDTO objects
        return listOfClans;
    }


    /**
     * @return a List of all Reports (as a list of GetReportDTO objects)
     */
    public List<GetReportDTO> getAllReports() {
        // Construct the SQL to get all reports
        // NOTE:  We do a left join to get all records from reports
        //        If a report record has null  for priority, then priority is null
        //        If a report record has a priority it, then get the name for that priority
        String sql = "select r.id, r.name, l.name as priority, \n" +
                "       to_char(start_date, 'mm/dd/yyyy') as start_date, to_char(end_date, 'mm/dd/yyyy') as end_date \n" +
                "from ltfg.reports r \n" +
                "LEFT JOIN ltfg.lookup l on (r.priority = l.id) \n" +
                "order by id";

        // Use the rowMapper to convert the results into a list of GetReportDTO objects
        BeanPropertyRowMapper<GetReportDTO> rowMapper = new BeanPropertyRowMapper<>(GetReportDTO.class);

        // Execute the SQL and Convert the results into a list of GetReportDTO objects
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        List<GetReportDTO> listOfReports = jt.query(sql, rowMapper);

        // Return the list of GetReportDTO objects
        return listOfReports;
    }

    /**
     * @param aReportId holds the ID that uniquely identifies thie report in the database
     * @return TRUE if the ID is found in the reports table.  False otherwise.
     */
    public boolean doesReportIdExist(Integer aReportId) {
        if (aReportId == null) {
            return false;
        }

        String sql = "select id from ltfg.reports where id=?";
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        SqlRowSet rs = jt.queryForRowSet(sql, aReportId);
        return rs.next();
    }


    /**
     * @param aUsername holds the ID that uniquely identifies the user in the database
     * @return TRUE if the username is found in the users table.  False otherwise.
     */
    public boolean doesUsernameExist(String aUsername) {
        if (aUsername == null) {
            return false;
        }

        String sql = "SELECT user_name FROM ltfg.users\n" +
                "WHERE user_name = ?;";
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        SqlRowSet rs = jt.queryForRowSet(sql, aUsername);
        return rs.next();
    }


    /**
     * Update the Report record in the database
     *
     * @param aUpdateReportDTO holds the information from the front-end with new report info
     */
    public void updateReport(SetUpdateReportDTO aUpdateReportDTO) {
        // Construct the SQL to update this record
        String sql = "UPDATE ltfg.reports set name=:name, priority=:priority WHERE id=:id";

        // Create a parameter map
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("name", aUpdateReportDTO.getReportName());
        paramMap.put("priority", aUpdateReportDTO.getPriority());
        paramMap.put("id", aUpdateReportDTO.getId());

        // Execute the SQL and get the number of rows affected
        NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(this.dataSource);
        int rowsUpdated = np.update(sql, paramMap);

        if (rowsUpdated != 1) {
            throw new RuntimeException("I expected to update one report record.  Instead, I updated " + rowsUpdated + " records.  This should never happen.");
        }
    }

    /**
     * @param aReportId holds the ID that uniquely identifies a report in the database
     * @return GetUpdateReportDTO object that holds information to show in the "Edit Report" page
     */
    public GetUpdateReportDTO getInfoForUpdateReport(Integer aReportId) {
        // Construct the SQL to get information about this record
        String sql = "select name, priority from ltfg.reports where id=?";

        // Execute the SQL, generating a read-only SqlRowSet
        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        SqlRowSet rs = jt.queryForRowSet(sql, aReportId);

        if (!rs.next()) {
            throw new RuntimeException("Error in getInfoForUpdateReport():  I did not find any records in the database for this reportId " + aReportId);
        }

        // Get the values out of the SqlRowSet object
        String reportName = rs.getString("name");
        Integer priority = (Integer) rs.getObject("priority");

        // Build and return the DTO object
        GetUpdateReportDTO dto = new GetUpdateReportDTO(aReportId, priority, reportName);
        return dto;
    }


}
