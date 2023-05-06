package com.lessons.utilities;

import com.lessons.models.GetCharactersDTO;
import com.lessons.models.GetClansDTO;
import com.lessons.services.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GetGameDataRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(GetGameDataRunner.class);

    private final ReportService reportService;
    private final ElasticSearchService elasticSearchService;
    private final GameDataTransferService getGameData;

    public GetGameDataRunner(ReportService reportService, ElasticSearchService elasticSearchService, GameDataTransferService getGameData) {
        this.reportService = reportService;
        this.elasticSearchService = elasticSearchService;
        this.getGameData = getGameData;
    }

    @Override
    public void run(String... args) throws Exception {

        logger.debug("GetGameDataRunner() called");

//        getGameData.transferClanData();
//        getGameData.transferCharacterData();
//        getGameData.transferGameEventData();
//        getGameData.transferBuildingData();
//        getGameData.transferItemInventoryData();

        List<GetCharactersDTO> characters = reportService.getAllCharacters();
        String charactersIndex = "characters";
        String charactersMappingFilename = "characters.mapping.json";
        elasticSearchService.indexDataToElasticSearch(characters, charactersIndex, charactersMappingFilename);

        List<GetClansDTO> clans = reportService.getAllClans();
        String clansIndex = "clans";
        String clansMappingFilename = "clans.mapping.json";
        elasticSearchService.indexDataToElasticSearch(clans, clansIndex, clansMappingFilename);
    }
}