package com.lessons.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lessons.config.ElasticSearchResources;
import com.lessons.models.AutoCompleteDTO;
import com.lessons.models.AutoCompleteMatchDTO;
import com.lessons.models.grid.GridGetRowsResponseDTO;
import com.ning.http.client.AsyncHttpClient;
import com.ning.http.client.Response;
import com.sun.corba.se.spi.ior.Identifiable;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ElasticSearchService {

    private static final Logger logger = LoggerFactory.getLogger(ElasticSearchService.class);

    @Resource
    private ElasticSearchResources elasticSearchResources;

    private String elasticSearchUrl;
    private AsyncHttpClient asyncHttpClient;
    private final int ES_REQUEST_TIMEOUT_IN_MILLISECS = 90000;

    private ObjectMapper objectMapper;

    private final Pattern patMatchDoubleQuote     = Pattern.compile("\"");
    private final Pattern patMatchAscii1To31or128 = Pattern.compile("[\\u0000-\\u001F\\u0080]");
    private final Pattern patMatchBackwardSlashMissingReserveChar = Pattern.compile("\\\\([^+!-><)(:/}{*~]|\\Z)");


    @PostConstruct
    public void init() throws Exception {
        logger.debug("init() started.");

        // In order to make outgoing calls to ElasticSearch you need 2 things:
        //   1) The elastic search url -- e.g., "http://localhost:9201"
        //   2) The initialized AsyncHttpClient object
        this.elasticSearchUrl = elasticSearchResources.getElasticSearchUrl();
        this.asyncHttpClient = elasticSearchResources.getAsyncHttpClient();


        this.objectMapper = new ObjectMapper();

        // Create the reports mapping (if they do not exist)
        initializeMapping();

        logger.debug("init() finished.  elasticSearchUrl={}", this.elasticSearchUrl);
    }

    private void initializeMapping() throws Exception {
        if (! doesIndexExist("reports")) {
            // Create the reports ES mapping

            // Read the mapping file into a large string
            String reportsMappingAsJson = readInternalFileIntoString("reports.mapping.json");

            // Create a mapping in ElasticSearch
            createIndex("reports", reportsMappingAsJson);
        }
    }


    /**
     * Helper to read an entire file into a String -- handy for reading in JSON mapping files
     * @param aFilename holds the name of the file (found in /src/main/resources
     * @return the file's contents as a String
     * @throws Exception if there are problems reading from the file
     */
    public String readInternalFileIntoString(String aFilename) throws Exception {
        try (InputStream inputStream =  ElasticSearchService.class.getResourceAsStream("/" +
                aFilename)) {
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        }
    }


    /**
     * Create a new ES Index
     * @param aIndexName holds the name of the new index to create
     * @param aJsonMapping holds the mapping of this index
     * @throws Exception if something bad happens
     */
    public void createIndex(String aIndexName, String aJsonMapping) throws Exception {
        logger.debug("createIndex() started.  aIndexName={}", aIndexName);

        if (StringUtils.isEmpty(aIndexName)) {
            throw new RuntimeException("The passed-in aIndexName is null or empty.");
        }

        String indexUrl = this.elasticSearchUrl + "/" + aIndexName;

        // Check if the index exists
        Response indexExistsResponse = this.asyncHttpClient.prepareHead(indexUrl)
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .execute()
                .get();

        if (indexExistsResponse.getStatusCode() == 404) {
            logger.debug("Going to this url:  {}", indexUrl);

            // Make a synchronous POST call to ElasticSearch to create this an index
            Response createIndexResponse = this.asyncHttpClient.preparePut(indexUrl)
                    .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                    .setHeader("accept", "application/json")
                    .setHeader("Content-Type", "application/json")
                    .setBody(aJsonMapping)
                    .execute()
                    .get();

            if (createIndexResponse.getStatusCode() != 200) {
                // ElasticSearch returned a non-200 status response
                throw new RuntimeException("Error in createIndex:  ES returned a status code of " +
                        createIndexResponse.getStatusCode() + " with an error of: " + createIndexResponse.getResponseBody());
            }

            logger.info("Successfully created this ES index: {}", aIndexName);
        } else {
            logger.info("Index '{}' already exists. Skipping index creation.", aIndexName);
        }
    }


    /**
     * Do a bulk update within ES
     * @param aBulkUpdateJson Holds the JSON bulk string
     * @param aWaitForRefresh Holds TRUE if we will wait for a refresh
     * @throws Exception if something bad happens
     */
    public void bulkUpdate(String aBulkUpdateJson, boolean aWaitForRefresh) throws Exception {
        if (StringUtils.isEmpty(aBulkUpdateJson)) {
            throw new RuntimeException("The passed-in JSON is null or empty.");
        }

        // Split the input JSON string into lines
        String[] lines = aBulkUpdateJson.split("\n");

        // Iterate through the lines, processing them in pairs (action and source)
        for (int i = 0; i < lines.length; i += 2) {
            String actionLine = lines[i];
            String sourceLine = lines[i + 1];

            // Deserialize action and source lines into maps
            Map<String, Object> action = objectMapper.readValue(actionLine, new TypeReference<Map<String, Object>>() {});
            Map<String, Object> source = objectMapper.readValue(sourceLine, new TypeReference<Map<String, Object>>() {});

            if (action.get("index") == null) {
                logger.warn("Missing index action metadata, skipping document: {}", source);
                continue;
            }

            // Extract the index action metadata
            Map<String, Object> indexAction = objectMapper.convertValue(action.get("index"), new TypeReference<Map<String, Object>>() {});

            // Add the source data to the index action metadata
            indexAction.putAll(source);

            // Process the document
            try {
                indexDocument(indexAction, aWaitForRefresh);
            } catch (Exception e) {
                String docId = indexAction.containsKey("_id") && indexAction.get("_id") != null ? indexAction.get("_id").toString() : "unknown";
                logger.error("Error indexing document with id '{}': {}", docId, e.getMessage());
            }
        }
    }


    /**
     * Do a bulk update within ES
     * @param dataList Holds the data object list
     * @param indexName Holds the index name to be created and populated
     * @param mappingFilename Holds the mapping file name as a string
     * @throws Exception if something bad happens
     */
    public <T> void indexDataToElasticSearch(List<T> dataList, String indexName, String mappingFilename) throws Exception {
        // Read the mapping file into a large string
        String mappingAsJson = readInternalFileIntoString(mappingFilename);

        // Create a mapping in ElasticSearch
        createIndex(indexName, mappingAsJson);

        // Index data from the list to Elasticsearch
        ObjectMapper objectMapper = new ObjectMapper();
        StringBuilder bulkUpdateJson = new StringBuilder();

        for (T dataObject : dataList) {
            // Create the Elasticsearch Bulk API action
            Map<String, Object> action = new HashMap<>();
            Map<String, Object> index = new HashMap<>();
            index.put("_index", indexName);
            index.put("_id", ((Identifiable) dataObject).getId()); // Assuming the object has a getId() method
            action.put("index", index);

            // Convert the action to JSON and add it to the bulkUpdateJson
//            String actionJson = objectMapper.writeValueAsString(action);
            String actionJson = String.format( "{ \"index\": { \"_index\": \"%s\", \"_id\": %d }}", indexName, ((Identifiable) dataObject).getId());
            bulkUpdateJson.append(actionJson).append("\n");

            // Convert the data object to JSON and add it to the bulkUpdateJson
            String dataJson = objectMapper.writeValueAsString(dataObject);
            bulkUpdateJson.append(dataJson).append("\n");
        }

        // Call the bulkUpdate method with the JSON string
        try {
            bulkUpdate(bulkUpdateJson.toString(), true);
        } catch (Exception e) {
            // Handle the exception here
            e.printStackTrace();
        }
    }


    /**
     * Index a single document within ES
     * @param doc Holds the document to be indexed
     * @param aWaitForRefresh Holds TRUE if we will wait for a refresh
     * @throws Exception if something bad happens
     */
    private void indexDocument(Map<String, Object> doc, boolean aWaitForRefresh) throws Exception {
        // Check if the passed-in document is empty or missing required fields
        if (doc == null || !doc.containsKey("_index") || !doc.containsKey("_id")) {
            throw new RuntimeException("The passed-in document is null or missing required fields.");
        }

        // Store the index name and document ID, and remove them from the document
        String indexName = doc.get("_index").toString();
        String documentId = doc.get("_id").toString();
        doc.remove("_index");
        doc.remove("_id");

        // Build the URL for the Elasticsearch index operation
        String url = this.elasticSearchUrl + "/" + indexName + "/_doc/" + documentId;
        if (aWaitForRefresh) {
            url = url + "?refresh=wait_for";
        }

        // Convert the document map into a JSON string
        String jsonBody = objectMapper.writeValueAsString(doc);

        // Execute the index operation using the async HTTP client
        Response response = this.asyncHttpClient.preparePost(url)
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "application/json")
                .setHeader("Content-Type", "application/json")
                .setBody(jsonBody)
                .execute()
                .get();

        // Check the response status code and throw an exception if it's not 200 or 201
        if (response.getStatusCode() != 200 && response.getStatusCode() != 201) {
            throw new RuntimeException("Error in indexDocument: ES returned a status code of " + response.getStatusCode() + " with an error of: " + response.getResponseBody());
        }
    }


    /**
     * Delete the index from ElasticSearch
     * @param aIndexName  holds the index name (or alias name)
     */
    public void deleteIndex(String aIndexName) throws Exception {
        if (StringUtils.isEmpty(aIndexName)) {
            throw new RuntimeException("The passed-in aIndexName is null or empty.");
        }

        // Make a synchronous POST call to delete this ES Index
        Response response = this.asyncHttpClient.prepareDelete(this.elasticSearchUrl + "/" +
                aIndexName)
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "application/json")
                .setHeader("Content-Type", "application/json")
                .execute()
                .get();

        if (response.getStatusCode() != 200) {
            // ElasticSearch returned a non-200 status response
            throw new RuntimeException("Error in deleteIndex:  ES returned a status code of " +
                    response.getStatusCode() + " with an error of: " + response.getResponseBody());
        }
    }


    /**
     * Helper method to determine if the passed-in ES mapping name or alias exists
     * @param aIndexName holds the ES mapping name or alias
     * @return TRUE if the passed-in index or alias exists
     */
    public boolean doesIndexExist(String aIndexName) throws Exception {

        if (StringUtils.isEmpty(aIndexName)) {
            throw new RuntimeException("The passed-in aIndexName is null or empty.");
        }

        // Make a synchronous GET call to get a list of all index names
        Response response = this.asyncHttpClient.prepareGet(this.elasticSearchUrl + "/_cat/indices")
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "text/plain")
                .execute()
                .get();

        if (response.getStatusCode() != 200) {
            throw new RuntimeException("Critical error in doesIndexExist():  ElasticSearch returned a response status code of " +
                    response.getStatusCode() + ".  Response message is " +
                    response.getResponseBody() );
        }

        // Loop through the lines of data -- looking for the passed-in index name
        String linesOfInfo = response.getResponseBody();
        if (StringUtils.isNotEmpty(linesOfInfo)) {
            String[] lines = linesOfInfo.split("\n");

            for (String line : lines) {
                String[] indexParts = line.split(" ");
                if (indexParts.length >= 3) {
                    String actualIndexName = indexParts[2];

                    if (actualIndexName.equalsIgnoreCase(aIndexName)) {
                        logger.debug("doesIndexExist() returns true for {}", aIndexName);
                        return true;
                    }
                }
            }
        }

        // The index name was not found in the system.  So, return false
        return false;

    }  // end of doesIndexExist()


    /**
     * @param aRawQuery holds the raw query text
     * @return an empty string (if the passed-in string is null
     */
    private String cleanupRawQuery(String aRawQuery) {
        String cleanedQuery = aRawQuery;

        if (cleanedQuery == null) {
            cleanedQuery = "";
        }

        return cleanedQuery;
    }


    /**
     * Run an auto-complete search
     * @param aAutoCompleteDTO   holds information about the index and what field to search
     * @return a list of matching AutoCompleteMatchDTO objects (or an empty list if no matches are found)
     * @throws Exception if something bad happens
     */
    public List<AutoCompleteMatchDTO> runAutoComplete(AutoCompleteDTO aAutoCompleteDTO) throws Exception {
        if (aAutoCompleteDTO == null) {
            throw new RuntimeException("Error in runAutoComplete():  The passed-in aAutoCompleteDTO is null.");
        }

        String cleanedQuery = cleanupRawQuery(aAutoCompleteDTO.getRawQuery());

        // Convert the cleaned query to lowercase (which is required as all ngrams are lowercase)
        cleanedQuery = cleanedQuery.toLowerCase();

        String jsonRequest =
                "{\n" +
                        "  \"_source\": [\"" + aAutoCompleteDTO.getReturnedField() + "\"]," +
                        "  \"query\": {\n" +
                        "    \"term\": {\n" +
                        "       \"" + aAutoCompleteDTO.getSearchedField() + "\": \"" + cleanedQuery + "\"\n" +
                        "     }\n" +
                        "  },\n" +
                        "  \"size\": " + aAutoCompleteDTO.getSize() +"\n" +
                        "}";

        // Make a synchronous POST call to run this ES search
        Response response = this.asyncHttpClient.preparePost(this.elasticSearchUrl + "/" + aAutoCompleteDTO.getIndexName() + "/_search")
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "application/json")
                .setHeader("Content-Type", "application/json")
                .setBody(jsonRequest)
                .execute()
                .get();

        if (response.getStatusCode() != 200) {
            // ElasticSearch returned a non-200 status response
            throw new RuntimeException("Error in runAutoComplete():  ES returned a status code of " + response.getStatusCode() + " with an error of: " + response.getResponseBody());
        }

        // Create an empty array list
        List<AutoCompleteMatchDTO> listOfAutoCompleteMatchDTOs = new ArrayList<>();

        // Pull the list of matching values from the JSON Response
        String jsonResponse = response.getResponseBody();

        // Convert the response JSON string into a map and examine it to see if the request really worked
        Map<String, Object> mapResponse = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});

        @SuppressWarnings("unchecked")
        Map<String, Object> outerHits = (Map<String, Object>) mapResponse.get("hits");
        if (outerHits == null) {
            throw new RuntimeException("Error in runAutoComplete():  The outer hits value was not found in the JSON response");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> innerHits = (List<Map<String, Object>>) outerHits.get("hits");
        if (innerHits == null) {
            throw new RuntimeException("Error in runAutoComplete():  The inner hits value was not found in the JSON response");
        }

        if (innerHits.size() > 0) {
            for (Map<String, Object> hit: innerHits) {

                // Get the _id field from the hit map
                String id = (String) hit.get("_id");

                @SuppressWarnings("unchecked")
                Map<String, Object> sourceMap = (Map<String, Object>) hit.get("_source");
                if (sourceMap == null) {
                    throw new RuntimeException("Error in runAutoComplete():  The source map was null in the JSON response");
                }

                // Get the matching returned field
                String match = (String) sourceMap.get(aAutoCompleteDTO.getReturnedField());

                // Create an AutoCompleteMatchDTO object
                AutoCompleteMatchDTO matchDTO = new AutoCompleteMatchDTO(id, match);

                // Add the AutoCompleteMatchDTO object to the list
                // (so the front-end will have an id and name field for this match)
                listOfAutoCompleteMatchDTOs.add(matchDTO);
            }
        }

        // Return the list of matching strings
        return listOfAutoCompleteMatchDTOs;
    }


    public GridGetRowsResponseDTO runSearchGetRowsResponseDTO(String aIndexName, String aJsonBody) throws Exception {
        if (StringUtils.isEmpty(aIndexName)) {
            throw new RuntimeException("The passed-in aIndexName is null or empty.");
        }
        else if (StringUtils.isEmpty(aJsonBody)) {
            throw new RuntimeException("The passed-in aJsonBody is null or empty.");
        }

        // Make a synchronous POST call to execute a search and return a response object
        Response response = this.asyncHttpClient.prepareGet(this.elasticSearchUrl + "/" + aIndexName + "/_search")
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "application/json")
                .setHeader("Content-Type", "application/json")
                .setBody(aJsonBody)
                .execute()
                .get();

        if (response.getStatusCode() != 200) {
            throw new RuntimeException("Critical error in runSearchGetJsonResponse():  ElasticSearch returned a response status code of " +
                    response.getStatusCode() + ".  Response message is " + response.getResponseBody() + "\n\n" + aJsonBody);
        }

        // Create an empty array list
        List<Map<String, Object>> listOfMaps = new ArrayList<>();

        // Pull the list of matching values from the JSON Response
        String jsonResponse = response.getResponseBody();

        // Convert the response JSON string into a map and examine it to see if the request really worked
        Map<String, Object> mapResponse = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});

        @SuppressWarnings("unchecked")
        Map<String, Object> outerHitsMap = (Map<String, Object>) mapResponse.get("hits");
        if (outerHitsMap == null) {
            throw new RuntimeException("Error in runAutoComplete():  The outer hits value was not found in the JSON response");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> innerHitsListOfMaps = (List<Map<String, Object>>) outerHitsMap.get("hits");
        if (innerHitsListOfMaps == null) {
            throw new RuntimeException("Error in runAutoComplete():  The inner hits value was not found in the JSON response");
        }

        if (innerHitsListOfMaps.size() > 0) {
            for (Map<String, Object> hit: innerHitsListOfMaps) {

                // Get the source map (that has all of the results)
                @SuppressWarnings("unchecked")
                Map<String, Object> sourceMap = (Map<String, Object>) hit.get("_source");
                if (sourceMap == null) {
                    throw new RuntimeException("Error in runAutoComplete():  The source map was null in the JSON response");
                }

                // Add the sourceMap to the list of maps
                listOfMaps.add(sourceMap);
            }
        }

        Integer totalMatches = 0;

        if (listOfMaps.size() > 0) {
            // Get the total matches from the json
            @SuppressWarnings("unchecked")
            Map<String, Object> totalInfoMap = (Map<String, Object>) outerHitsMap.get("total");
            if ((totalInfoMap != null) && (totalInfoMap.size() > 0)) {
                totalMatches = (Integer) totalInfoMap.get("value");
            }
        }

        // Set the searchAfter clause in the GetResponseRowsDTO object
        // NOTE:  The front-end will pass this back for page 2, page 3, page 4
        //        so we can run the same ES query and get page 2, page 3, page 4
        String searchAfterClause = getSearchAfterFromEsResponseMap(innerHitsListOfMaps);

        GridGetRowsResponseDTO responseDTO = new GridGetRowsResponseDTO(listOfMaps, totalMatches, searchAfterClause);
        return responseDTO;
    }


    /**
     * Generate the search_after clause by looking at the last result from the last search
     *  1. If the list of maps is empty, return an empty string
     *  2. Loop through the sort model list
     *     -- Build the search_after by pulling the sorted field name
     *     -- If the sort field name == "_score", then pull the score
     *
     * @param aListOfHitsMaps holds the list of ES maps (that hold the search results)
     * @return a String that holds the search_after clause
     */
    private String getSearchAfterFromEsResponseMap(List<Map<String, Object>> aListOfHitsMaps) {
        if ((aListOfHitsMaps == null) || (aListOfHitsMaps.size() == 0)) {
            return "";
        }

        // Get the last map
        Map<String, Object> lastMap = aListOfHitsMaps.get( aListOfHitsMaps.size() - 1);
        if (lastMap == null) {
            return "";
        }

        // Get the last source map  (it has the search results for the last match)
        @SuppressWarnings("unchecked")
        Map<String, Object> lastSourceMap = (Map<String, Object>) lastMap.get("_source");
        if (lastSourceMap == null) {
            throw new RuntimeException("Error in getSearchAfterFromEsResponseMap():  The lastSourceMap is null.");
        }

        // Get the list of sort fields from the lastMap.sort
        @SuppressWarnings("unchecked")
        List<Object> listOfSortFields = (List<Object>) lastMap.get("sort");
        if ((listOfSortFields == null) || (listOfSortFields.size() == 0)) {
            throw new RuntimeException("Error in getSearchAfterFromEsResponseMap():  The listOfSortFields is null or empty.  It should have always have one or more items.");
        }

        StringBuilder sbSearchAfterClause = new StringBuilder();

        for (Object lastSortValueObject: listOfSortFields) {
            String lastSortValue = "\"" + String.valueOf( lastSortValueObject ) + "\"";

            sbSearchAfterClause.append(lastSortValue)
                    .append(",");
        }

        // Remove the last comma
        sbSearchAfterClause.deleteCharAt(sbSearchAfterClause.length() - 1);

        return sbSearchAfterClause.toString();
    }


    /**
     * Clean-up the passed-in raw query with the following rules:
     *   1) If Double quote is found, then replace it with \"
     *   2) If ASCII value between 1 and 31 is found or 128, then replace it with a space
     *   3) If "\" is found without a special reserve chars, then replace it with a space
     * @param aRawQuery holds the raw query from the front-end
     * @return cleaned-up query
     */
    public String cleanupQuery(String aRawQuery) {

        // Convert  "and " or " and " or " and" to --> AND
        // NOTE:  Do this first before encoding the quotes
        String cleanedQuery = adjustElasticSearchAndOrNotOperators(aRawQuery);

        // Convert the pattern match of " to \"
        // NOTE:  Because of Java Regex, you have to use four backward slashes to match a \
        cleanedQuery = this.patMatchDoubleQuote.matcher(cleanedQuery).replaceAll("\\\\\"");

        // If ASCII 1-31 or 128 is found, then replace it with a space
        cleanedQuery = this.patMatchAscii1To31or128.matcher(cleanedQuery).replaceAll(" ");

        // If a single backslash is found but the required reserve char is missing -- then replace it with a space
        cleanedQuery = this.patMatchBackwardSlashMissingReserveChar.matcher(cleanedQuery).replaceAll(" ");

        return cleanedQuery;
    }


    private String adjustElasticSearchAndOrNotOperators(String aString) {
        if (StringUtils.isBlank(aString)) {
            return aString;
        }

        // Convert the string into a list of Strings
        List<String> listOfWords = Arrays.asList(aString.trim().split("\\s+"));

        // Get the iterator
        ListIterator<String> iter = listOfWords.listIterator();

        boolean inQuotes = false;

        // Loop through the list and remove certain items
        while (iter.hasNext())
        {
            String word = iter.next();

            if (word.length() == 0) {
                continue;
            }

            if (word.equalsIgnoreCase("\"")) {
                // The entire word is an open quote
                inQuotes = !inQuotes;
                continue;
            }

            if ((word.startsWith("\"") && (! word.endsWith("\""))) ||
                    (! word.startsWith("\"") && (word.endsWith("\"")))) {
                // The word either starts or ends with a quote
                inQuotes = !inQuotes;
            }

            if (!inQuotes && (word.equalsIgnoreCase("and") || word.equalsIgnoreCase("or") || word.equalsIgnoreCase("not")))
            {
                // Convert this "and", "or", or "not" word to uppercase
                word = word.toUpperCase();
                iter.set(word);
            }
        }

        String returnedStirng = StringUtils.join(listOfWords, " ");
        return returnedStirng;
    }


    public boolean isQueryValid(String aIndexName, String aJsonBodyForQuery) throws Exception {
        if (StringUtils.isEmpty(aIndexName)) {
            throw new RuntimeException("The passed-in aIndexName is null or empty.");
        }
        else if (StringUtils.isEmpty(aJsonBodyForQuery)) {
            throw new RuntimeException("The passed-in aJsonBody is null or empty.");
        }

        // Make a synchronous POST call to run a _validate/query Call -- to see if this query is valid
        Response response = this.asyncHttpClient.prepareGet(this.elasticSearchUrl + "/" + aIndexName + "/_validate/query")
                .setRequestTimeout(this.ES_REQUEST_TIMEOUT_IN_MILLISECS)
                .setHeader("accept", "application/json")
                .setHeader("Content-Type", "application/json")
                .setBody(aJsonBodyForQuery)
                .execute()
                .get();

        if (response.getStatusCode() != 200) {
            throw new RuntimeException("Critical error in isQueryValid():  ElasticSearch returned a response status code of " +
                    response.getStatusCode() + ".  Response message is " + response.getResponseBody() + "\n\n" + aJsonBodyForQuery);
        }

        // Get the JSON response from the response object
        String jsonResponse = response.getResponseBody();

        // Convert the response JSON string into a map and examine it to see if the request really worked
        Map<String, Object> mapResponse = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});

        boolean isQueryValid = (boolean) mapResponse.get("valid");
        return isQueryValid;
    }

}
