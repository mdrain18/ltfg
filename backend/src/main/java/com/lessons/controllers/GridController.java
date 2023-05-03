package com.lessons.controllers;

import com.lessons.models.grid.GridGetRowsRequestDTO;
import com.lessons.models.grid.GridGetRowsResponseDTO;
import com.lessons.models.grid.SortModel;
import com.lessons.services.GridService;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.Resource;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Controller
public class GridController {
    private static final Logger logger = LoggerFactory.getLogger(GridController.class);

    @Resource
    private GridService gridService;


    /**
     * The "All Reports" AG-Grid calls this REST endpoint to load the grid in server-side mode
     *
     * @param aGridRequestDTO holds the Request information
     * @return ResponseEntity that holds a GridGetRowsResponseDTO object
     * @throws Exception if something bad happens
     */
    @RequestMapping(value = "/api/grid/all-reports/getRows", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> getRowsForAllReports(@RequestBody GridGetRowsRequestDTO aGridRequestDTO) throws Exception {
        logger.debug("getRowsForAllReports() started.");

        if (aGridRequestDTO.getStartRow() >= aGridRequestDTO.getEndRow()) {
            // This is an invalid request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The endRow must be greater than the startRow.");
        }

        // Change the sort field from "priority" to "priority.sort"  (so the sort is case insensitive -- see the mapping)
        changeSortFieldToUseElasticFieldsForSorting(aGridRequestDTO, "id");

        // Set Default sorting
        //  1) If the sorting model is not empty, then do nothing
        //  2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
        //  3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
        setDefaultSorting(aGridRequestDTO, "id");

        // Create an array of ES fields to **SEARCH**
        List<String> esFieldsToSearch = Arrays.asList("id.sort", "description", "display_name.sort", "priority.sort");

        // Create an array of ES fields to **RETURN**   (if this list is empty, then ES will return all fields in the ES mapping)
        List<String> esFieldsToReturn = Arrays.asList("id", "description", "display_name", "priority");

        // Invoke the GridService to run a search
        GridGetRowsResponseDTO responseDTO = gridService.getPageOfData("reports", esFieldsToSearch, esFieldsToReturn, aGridRequestDTO);

        // Return the responseDTO object and a 200 status code
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTO);
    }


    /**
     * The "Critical Reports" AG-Grid calls this REST endpoint to load the grid in server-side mode
     *
     * @param aGridRequestDTO holds the Request information
     * @return ResponseEntity that holds a GridGetRowsResponseDTO object
     * @throws Exception if something bad happens
     */
    @RequestMapping(value = "/api/grid/critical-reports/getRows", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> getRowsForCriticalReports(@RequestBody GridGetRowsRequestDTO aGridRequestDTO) throws Exception {
        logger.debug("getRowsForCriticalReports() started.");

        if (aGridRequestDTO.getStartRow() >= aGridRequestDTO.getEndRow()) {
            // This is an invalid request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The endRow must be greater than the startRow.");
        }

        // Set default raw-query string for this grid  (to limit all results to the critical reports)
        setDefaultSearchForGrid(aGridRequestDTO, "priority.sort:critical");

        // Change the sort field from "priority" to "priority.sort"  (so the sort is case insensitive -- see the mapping)
        changeSortFieldToUseElasticFieldsForSorting(aGridRequestDTO, "id");

        // Set Default sorting
        //  1) If the sorting model is not empty, then do nothing
        //  2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
        //  3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
        setDefaultSorting(aGridRequestDTO, "id");

        // Create an array of ES fields to **SEARCH**
        List<String> esFieldsToSearch = Arrays.asList("id.sort", "description", "display_name.sort", "priority.sort");

        // Create an array of ES fields to **RETURN**   (if this list is empty, then ES will return all fields in the ES mapping)
        List<String> esFieldsToReturn = Arrays.asList("id", "description", "display_name", "priority");

        // Invoke the GridService to run a search
        GridGetRowsResponseDTO responseDTO = gridService.getPageOfData("reports", esFieldsToSearch, esFieldsToReturn, aGridRequestDTO);

        // Return the responseDTO object and a 200 status code
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTO);
    }


    /**
     * The AG-Grid calls this REST endpoint to load the grid in server-side mode
     *
     * @param aGridRequestDTO holds the Request information
     * @return ResponseEntity that holds a GridGetRowsResponseDTO object
     * @throws Exception if something bad happens
     */
    @RequestMapping(value = "/api/grid/getCharacters", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> getCharacters(@RequestBody GridGetRowsRequestDTO aGridRequestDTO) throws Exception {
        logger.debug("getCharacters() started.");

        if (aGridRequestDTO.getStartRow() >= aGridRequestDTO.getEndRow()) {
            // This is an invalid request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The endRow must be greater than the startRow.");
        }

        // Change the sort field from "priority" to "priority.sort"  (so the sort is case insensitive -- see the mapping)
        changeSortFieldToUseElasticFieldsForSorting(aGridRequestDTO, "id");

        // Set Default sorting
        //  1) If the sorting model is not empty, then do nothing
        //  2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
        //  3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
        setDefaultSorting(aGridRequestDTO, "id");

        // Create an array of ES fields to **SEARCH**
        List<String> esFieldsToSearch = Arrays.asList("id.sort", "platform_id.sort", "character_name.sort",
                "level.sort", "created_at.sort", "last_login_date.sort", "clan_name.sort", "game_name.sort",
                "time_played.sort", "is_new.sort");

        // Create an array of ES fields to **RETURN** (if this list is empty, then ES will return all fields in the ES mapping)
        List<String> esFieldsToReturn = Arrays.asList("id", "platform_id", "character_name", "level", "created_at",
                "last_login_date", "clan_name", "game_name", "time_played", "is_new");

        // Invoke the GridService to run a search
        GridGetRowsResponseDTO responseDTO = gridService.getPageOfData("characters",
                esFieldsToSearch, esFieldsToReturn, aGridRequestDTO);

        // Return the responseDTO object and a 200 status code
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTO);
    }


    /**
     * The AG-Grid calls this REST endpoint to load the grid in server-side mode
     *
     * @param aGridRequestDTO holds the Request information
     * @return ResponseEntity that holds a GridGetRowsResponseDTO object
     * @throws Exception if something bad happens
     */
    @RequestMapping(value = "/api/grid/getClans", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> getClans(@RequestBody GridGetRowsRequestDTO aGridRequestDTO) throws Exception {
        logger.debug("getClans() started.");

        if (aGridRequestDTO.getStartRow() >= aGridRequestDTO.getEndRow()) {
            // This is an invalid request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The endRow must be greater than the startRow.");
        }

        // Change the sort field from "priority" to "priority.sort"  (so the sort is case insensitive -- see the mapping)
        changeSortFieldToUseElasticFieldsForSorting(aGridRequestDTO, "id");

        // Set Default sorting
        //  1) If the sorting model is not empty, then do nothing
        //  2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
        //  3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
        setDefaultSorting(aGridRequestDTO, "id");

        // Create an array of ES fields to **SEARCH**
        List<String> esFieldsToSearch = Arrays.asList(
                "id.sort",
                "clanName.sort",
                "messageOfTheDay.sort",
                "ownerId.sort",
                "totalMembers.sort",
                "activeMembers.sort",
                "memberGrowthRate.sort",
                "warWins.sort",
                "warLosses.sort",
                "buildingCount.sort",
                "storedBuildingCount.sort",
                "inventoryCount.sort",
                "clanKDRatio.sort",
                "lastUpdated.sort"
        );

        // Create an array of ES fields to **RETURN** (if this list is empty, then ES will return all fields in the ES mapping)
        List<String> esFieldsToReturn = Arrays.asList(
                "id",
                "clanName",
                "messageOfTheDay",
                "ownerId",
                "totalMembers",
                "activeMembers",
                "memberGrowthRate",
                "warWins",
                "warLosses",
                "buildingCount",
                "storedBuildingCount",
                "inventoryCount",
                "clanKDRatio",
                "lastUpdated"
        );

        // Invoke the GridService to run a search
        GridGetRowsResponseDTO responseDTO = gridService.getPageOfData("clans",
                esFieldsToSearch, esFieldsToReturn, aGridRequestDTO);

        // Return the responseDTO object and a 200 status code
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTO);
    }


    /**
     * The AG-Grid calls this REST endpoint to load the grid in server-side mode
     *
     * @param aGridRequestDTO holds the Request information
     * @return ResponseEntity that holds a GridGetRowsResponseDTO object
     * @throws Exception if something bad happens
     */
    @RequestMapping(value = "/api/grid/getRows", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> getRows(@RequestBody GridGetRowsRequestDTO aGridRequestDTO) throws Exception {
        logger.debug("getRows() started.");

        if (aGridRequestDTO.getStartRow() >= aGridRequestDTO.getEndRow()) {
            // This is an invalid request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("The endRow must be greater than the startRow.");
        }

        // Change the sort field from "priority" to "priority.sort"  (so the sort is case insensitive -- see the mapping)
        changeSortFieldToUseElasticFieldsForSorting(aGridRequestDTO, "id");

        // Set Default sorting
        //  1) If the sorting model is not empty, then do nothing
        //  2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
        //  3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
        setDefaultSorting(aGridRequestDTO, "id");

        // Create an array of ES fields to **SEARCH**
        List<String> esFieldsToSearch = Arrays.asList("id.sort", "description", "display_name.sort", "priority.sort");

        // Create an array of ES fields to **RETURN**   (if this list is empty, then ES will return all fields in the ES mapping)
        List<String> esFieldsToReturn = Arrays.asList("id", "description", "display_name", "priority");

        // Invoke the GridService to run a search
        GridGetRowsResponseDTO responseDTO = gridService.getPageOfData("reports", esFieldsToSearch, esFieldsToReturn, aGridRequestDTO);

        // Return the responseDTO object and a 200 status code
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTO);
    }


    /**
     * Set default sorting
     * 1) If the sorting model is not empty and does not contain the "id" score, then append "id" ascending
     * 2) If the sorting model to empty and rawSearchQuery is empty, then sort by "id" ascending
     * 3) If the sorting model is empty and rawSearchQuery is not empty, then sort by "_score" descending
     * <p>
     * ASSUMPTION:  Every query must have a sort field set so that the "infinity scroll" works
     * So, every query sent to ElasticSearch must be sorted on something -- either the "score" for sorting on relevancy or some sort field
     * If no sort field is provided, the the ES query will be sorted by the default ID field
     *
     * @param aGridRequestDTO holds information about the grid request
     */
    private void setDefaultSorting(GridGetRowsRequestDTO aGridRequestDTO, String aNameOfIdField) {
        if (CollectionUtils.isNotEmpty(aGridRequestDTO.getSortModel())) {
            // Sorting model is not empty.  So, user is sorting by a column.  Append the id field ascending (if it's not already there)

            for (SortModel sortModel : aGridRequestDTO.getSortModel()) {
                if ((sortModel.getColId() != null) && (sortModel.getColId().equalsIgnoreCase(aNameOfIdField))) {
                    // The SortModel is not empty and *ALREADY* contains the "id" field.  So, do nothing.
                    return;
                }
            }

            // The SortModel is not empty and does *NOT* contain the "id" column.  So, add the "id" ascending to the list of sort models
            SortModel sortById = new SortModel(aNameOfIdField, "asc");
            aGridRequestDTO.getSortModel().add(sortById);
            return;
        }

        List<SortModel> sortModelList;

        // The sorting model is empty
        if (StringUtils.isBlank(aGridRequestDTO.getRawSearchQuery())) {
            // The sorting model is empty and rawSearchQuery is blank
            // -- User is *not* running a search.  So, sort by "id" ascending
            SortModel sortById = new SortModel(aNameOfIdField, "asc");
            sortModelList = Collections.singletonList(sortById);
        } else {
            // The sorting mode is empty and rawSearchQuery is not empty
            // -- User is running a search.  SO, sort by "_score" descending *AND* by "id"
            //    NOTE:  When using the search_after technique to get the next page, we need to sort by _score *AND* id
            SortModel sortByScore = new SortModel("_score", "desc");
            SortModel sortById = new SortModel(aNameOfIdField, "asc");
            sortModelList = Arrays.asList(sortByScore, sortById);
        }


        aGridRequestDTO.setSortModel(sortModelList);
    }


    private void changeSortFieldToUseElasticFieldsForSorting(GridGetRowsRequestDTO aGridRequestDTO, String aNameOfIdField) {

        if (CollectionUtils.isNotEmpty(aGridRequestDTO.getSortModel())) {
            for (SortModel sortModel : aGridRequestDTO.getSortModel()) {
                String sortFieldName = sortModel.getColId();
                if (!sortFieldName.equalsIgnoreCase(aNameOfIdField)) {
                    sortFieldName = sortFieldName + ".sort";
                    sortModel.setColId(sortFieldName);
                }
            }
        }
    }


    private void setDefaultSearchForGrid(GridGetRowsRequestDTO aGridRequestDTO, String aDefaultQueryString) {

        if (StringUtils.isBlank(aGridRequestDTO.getRawSearchQuery())) {
            // Search text is empty so set it to search for registered users
            aGridRequestDTO.setRawSearchQuery(aDefaultQueryString);
        } else {
            // Search text is not empty so AND the default search text to the original query
            String newSearchText = aGridRequestDTO.getRawSearchQuery() + " AND " + aDefaultQueryString;
            aGridRequestDTO.setRawSearchQuery(newSearchText);
        }
    }

}