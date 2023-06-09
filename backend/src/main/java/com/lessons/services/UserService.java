package com.lessons.services;

import com.lessons.models.RegisterUser;
import com.lessons.models.ValidateUsersDTO;
import com.lessons.security.UserInfo;
import com.lessons.utilities.PasswordEncrypter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("com.lessons.services.UserService")
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Resource
    private DataSource dataSource;

    @Resource
    private DatabaseService databaseService;

    /**
     * @return the UserInfo object from Spring-Security
     */
    public UserInfo getUserInfo() {
        // Get the UserInfo object from Spring Security
        SecurityContext securityContext = SecurityContextHolder.getContext();

        if (securityContext == null) {
            throw new RuntimeException("Error in getUserInfoFromSecurity():  SecurityContext is null.  This should never happen.");
        }

        Authentication auth = securityContext.getAuthentication();
        if (auth == null) {
            throw new RuntimeException("Error in getUserInfoFromSecurity():  Authentication is null.  This should never happen.");
        }

        UserInfo userInfo = (UserInfo) auth.getPrincipal();
        if (userInfo == null) {
            throw new RuntimeException("Error in getUserInfoFromSecurity():  UserInfo is null.  This should never happen.");
        }

        return userInfo;
    }


    /**
     * Attempt to add a report record to the database
     *
     * @param newUser Pass-in model object that holds all the report fields
     */
    public void addUser(RegisterUser newUser) throws NoSuchAlgorithmException {
        logger.debug("addUser() started.");

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
     * 1) Take the user entered username and password and check if there is a match
     * 2) If isMatch is true, update last login time
     *
     * @param validateUser: username and password entered by user
     * @return boolean: true if there is a match, false if not
     * @throws NoSuchAlgorithmException
     */
    public Boolean validateLogin(ValidateUsersDTO validateUser) throws NoSuchAlgorithmException {
        logger.debug("validateLogin() started.");

        String sql = "SELECT id, password FROM ltfg.users\n" +
                "WHERE user_name = ?;";

        JdbcTemplate jt = new JdbcTemplate(this.dataSource);
        SqlRowSet rs = jt.queryForRowSet(sql, validateUser.getUsername());
        if (rs.next()) {
            // I found the record in the database, now we check the password
            boolean isMatch = PasswordEncrypter.comparePasswords(validateUser.getPassword(), rs.getString("password"));
            if (isMatch) {
                updateLastLoginDate(rs.getInt("id"));
                return true;
            } else {
                return false;
            }
        } else {
            // I did not find this username in the database.
            return false;
        }
    }


    /**
     * @return The name of the logged-in user
     */
    public String getLoggedInUserName() {
        UserInfo userinfo = getUserInfo();

        return userinfo.getUsername();
    }

    /**
     * @return The ID of the logged-in user
     */
    public Integer getLoggedInUserId() {
        UserInfo userinfo = getUserInfo();

        return userinfo.getId();
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


    private void updateLastLoginDate(Integer aUserId) {
        TransactionTemplate tt = new TransactionTemplate();
        tt.setTransactionManager(new DataSourceTransactionManager(dataSource));

        // This transaction will throw a TransactionTimedOutException after 60 seconds (causing the transaction to rollback)
        tt.setTimeout(60);

        tt.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus aStatus) {

                // Construct the SQL to set the last login date
                String sql = "UPDATE ltfg.users SET last_login_date = now() WHERE id = :userId";

                Map<String, Object> paramMap = new HashMap<>();
                paramMap.put("userId", aUserId);

                NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(dataSource);

                // Executing SQL to update the users record
                int totalRowsUpdated = np.update(sql, paramMap);

                if (totalRowsUpdated != 1) {
                    throw new RuntimeException("Error in updateLastLoginDate(). I expected to update 1 record " +
                            "but I actually updated " + totalRowsUpdated);
                }
            }
        });
    }

    public synchronized Integer getOrAddUserRecordsToSystem(String aUsername) {
        // This SQL string will check if the id already exists
        String sql = "select id from ltfg.users where user_name = ?";

        JdbcTemplate jt = new JdbcTemplate(this.dataSource);

        SqlRowSet rs = jt.queryForRowSet(sql, aUsername);

        Integer userId;

        if (rs.next()) {
            // The username exists in the database
            // Updating the last login date
            userId = rs.getInt("id");

            updateLastLoginDate(userId);
        } else {
            // The username does not exist in the database
            // Inserting a new users record
            userId = insertUsersRecord(aUsername);
        }

        return userId;
    }

    private Integer insertUsersRecord(String aUsername) {
        TransactionTemplate tt = new TransactionTemplate();
        tt.setTransactionManager(new DataSourceTransactionManager(dataSource));

        // This transaction will throw a TransactionTimedOutException after 60 seconds (causing the transaction to rollback)
        tt.setTimeout(60);


        // Tell the tt object that this method returns a String
        Integer returnedUserId = tt.execute(new TransactionCallback<Integer>() {

            @Override
            public Integer doInTransaction(TransactionStatus aStatus) {
                // All database calls in this block are part of a SQL Transaction

                // Construct the SQL to get these columns of data
                String sql = "insert into ltfg.users (user_name, full_name, is_locked, last_login_date)\n" +
                        "values (:userName, :fullName, false, now())";

                Map<String, Object> paramMap = new HashMap<>();
                //paramMap.put("userId", userId);
                paramMap.put("userName", aUsername);
                paramMap.put("fullName", aUsername);

                NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(dataSource);

                // Executing SQL to insert the new user into the users table
                int totalRowsInserted = np.update(sql, paramMap);

                if (totalRowsInserted != 1) {
                    throw new RuntimeException("Error in insertUsersRecord(). I expected to insert 1 record " +
                            "but I actually inserted " + totalRowsInserted);
                }

                sql = "SELECT id FROM ltfg.users WHERE user_name = ?";
                Object[] params = {aUsername};
                JdbcTemplate jt = new JdbcTemplate(dataSource);
                Integer userId = jt.queryForObject(sql, params, Integer.class);
                return userId;
            }
        });

        return returnedUserId;
    }


    public Map<String, Boolean> generateAccessMap(List<GrantedAuthority> aGrantedRoleAuthorities) {

        // Convert the list of granted authority objects into a list of strings (and strip-off the "ROLE_" prefix)
        List<String> roleList = aGrantedRoleAuthorities.stream().map(auth -> {
            String authString = auth.toString();
            if (authString.startsWith("ROLE_")) {
                // Remove the "ROLE_" prefix
                return authString.substring(5);
            } else {
                return authString;
            }
        }).collect(Collectors.toList());

        // Create a parameter map (required to use bind variables with postgres IN clause)
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("roleList", roleList);

        // Construct the SQL to get list of all ui-controls with true if allowed and false if not allowed
        String sql = "SELECT DISTINCT ui.name, true AS access\n" +
                "FROM ltfg.uicontrols ui\n" +
                "         JOIN ltfg.roles r " +
                "           ON (r.name IN ( :roleList ))\n" +
                "         JOIN ltfg.roles_uicontrols ru " +
                "           ON (r.id=ru.role_id) " +
                "           AND (ui.id=ru.uicontrol_id)\n" +
                "ORDER BY 1";

        // Execute the query to get all ui-controls that are allowed for this user's role
        NamedParameterJdbcTemplate np = new NamedParameterJdbcTemplate(this.dataSource);
        SqlRowSet rs = np.queryForRowSet(sql, paramMap);

        // Create the map
        Map<String, Boolean> accessMap = new HashMap<>();

        // Loop through the SqlRowSet, putting the results into a map
        while (rs.next()) {
            accessMap.put(rs.getString("name"), rs.getBoolean("access"));
        }
        // Return the map
        return accessMap;
    }


    /**
     * End the User's Session
     */
    public void endSession() {
        // Get the UserInfo object from Spring Security
        SecurityContext securityContext = SecurityContextHolder.getContext();
        if (securityContext == null) {
            throw new RuntimeException("Error in endSession():  SecurityContext is null.  This should never happen.");
        }

        // Clear the user's authentication
        securityContext.setAuthentication(null);
    }

}
