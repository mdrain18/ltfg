package com.lessons.controllers;

import com.lessons.models.UserInfoDTO;
import com.lessons.security.UserInfo;
import com.lessons.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.Resource;
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