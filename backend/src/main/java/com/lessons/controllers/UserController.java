package com.lessons.controllers;

import com.lessons.models.RegisterUser;
import com.lessons.models.UserInfoDTO;
import com.lessons.models.ValidateUsersDTO;
import com.lessons.security.UserInfo;
import com.lessons.services.UserService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.Resource;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Controller
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Resource
    private UserService userService;

    /**
     * REST endpoint /api/user/me
     */
    @RequestMapping(value = "/api/user/me", method = RequestMethod.GET, produces = "application/json")
    @PreAuthorize("hasAnyRole('READER', 'ADMIN')")
    public ResponseEntity<?> getUserInfo() {

        // Get the user's logged-in name
        String loggedInUsername = userService.getLoggedInUserName();

        // Get the user's access map (from the UserInfo object)
        UserInfo userInfo = userService.getUserInfo();
        Map<String, Boolean> accessMap = userInfo.getAccessMap();

        // Create the UserInfoDTO object
        UserInfoDTO userInfoDTO = new UserInfoDTO(loggedInUsername, accessMap);

        // Return a response of 200 and the UserInfoDTO object
        return ResponseEntity.status(HttpStatus.OK).body(userInfoDTO);
    }


    /**
     * POST /api/user/register
     * Update the Report record in the system
     * @return 200 status code if the update worked
     */
    @RequestMapping(value = "/api/user/register", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUser aSingleUser) throws NoSuchAlgorithmException {
        logger.debug("registerUser() started.");

        // Verify that required parameters were passed-in
        if (StringUtils.isBlank(aSingleUser.getUserName())) {
            // The Username was not passed-in
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The username is null.  This is an invalid parameter.");
        }
        else if (StringUtils.isBlank(aSingleUser.getEmail())) {
            // The email is blank
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The report name is blank.  This is an invalid parameter.");
        }
        else if (StringUtils.isBlank(aSingleUser.getPassword())) {
            // The password is blank
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The report name is blank.  This is an invalid parameter.");
        }
        else if (userService.doesUsernameExist(aSingleUser.getUserName() ) ) {
            // The report ID was not found in the system
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Username already exists.");
        }

        // Update the report record
        userService.addUser(aSingleUser);

        // Return only a 200 status code
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.TEXT_PLAIN)
                .body("");
    }


    /**
     * POST /api/user/val
     * Update the Report record in the system
     * @return 200 status code if the update worked
     */
    @RequestMapping(value = "/api/user/val", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> validateLogin(@RequestBody ValidateUsersDTO validateUser) throws NoSuchAlgorithmException {
        logger.debug("validateLogin() started.");

        // Validate if the username and password are correct
        Boolean response = userService.validateLogin(validateUser);

        // Verify that required parameters were passed-in
        if (StringUtils.isBlank(validateUser.getUsername())) {
            // The username was not passed-in
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The username is blank.  This is an invalid parameter.");
        }
        else if (StringUtils.isBlank(validateUser.getPassword())) {
            // The password is blank
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The password is blank.  This is an invalid parameter.");
        } else if (!response) {
            // There was a mismatch between the username and password
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The username or password is incorrect.");
        }

        // Return only a 200 status code
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.TEXT_PLAIN)
                .body("");
    }


    /**
     * GET /api/ack/get
     */
    @RequestMapping(value = "/api/user/ack/get", method = RequestMethod.GET, produces = "application/json")
    @PreAuthorize("hasAnyRole('READER', 'ADMIN')")
    public ResponseEntity<?> getUserAcknowledged() {

        // Get the UserInfo object (which holds the user's session info)
        UserInfo userInfo = this.userService.getUserInfo();

        // Get the boolean (which holds true if the user has acknowledged the popup)
        Boolean userHasAcknowledged = userInfo.getUserAcknowledgedMessage();

        // Return a response of 200 and the boolean object
        return ResponseEntity.status(HttpStatus.OK).body(userHasAcknowledged);
    }


    /**
     * POST /api/ack/set
     */
    @RequestMapping(value = "/api/user/ack/set", method = RequestMethod.POST, produces = "application/json")
    @PreAuthorize("hasAnyRole('READER', 'ADMIN')")
    public ResponseEntity<?> setUserAcknowledged() {

        // Get the UserInfo object (which holds the user's session info)
        UserInfo userInfo = this.userService.getUserInfo();

        // Set this session as having acknowledged the popup
        userInfo.setUserAcknowledgedMessage();

        // Return a response of 200
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }


    /**
     * POST /api/user/logout
     */
    @RequestMapping(value = "/api/user/logout", method = RequestMethod.POST, produces = "application/json")
    @PreAuthorize("hasAnyRole('READER', 'ADMIN')")
    public ResponseEntity<?> logoutUser() {

        // End the user's session
        userService.endSession();

        // Return a response of 200 and an empty string
        return ResponseEntity.status(HttpStatus.OK).body("");
    }

}