package com.lessons.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@SuppressWarnings("SqlResolve")
@Service
public class GameDataTransferService {

    private static final Logger logger = LoggerFactory.getLogger(GameDataTransferService.class);

    private final JdbcTemplate sqliteJdbcTemplate;
    private final JdbcTemplate postgresJdbcTemplate;

    public GameDataTransferService(@Qualifier("sqliteJdbcTemplate") JdbcTemplate sqliteJdbcTemplate,
                                   @Qualifier("postgresJdbcTemplate") JdbcTemplate postgresJdbcTemplate) {
        this.sqliteJdbcTemplate = sqliteJdbcTemplate;
        this.postgresJdbcTemplate = postgresJdbcTemplate;
    }

    public void transferCharacterData() throws ParseException {

        logger.debug("transferCharacterData() called");
        // Get all the needed information for the characters table
        List<Map<String, Object>> results = sqliteJdbcTemplate.queryForList(
                "select c.id, c.char_name, a.user, c.level, c.guild, c.lastTimeOnline\n" +
                        "from main.characters c\n" +
                        "left join main.account a\n" +
                        "    on a.id = c.playerId\n" +
                        "order by playerId ASC;");

        for (Map<String, Object> row : results) {
            Integer id          = (Integer) row.get("id");
            String charName     = (String) row.get("char_name");
            String platformID   = (String) row.get("user");
            Integer level       = (Integer) row.get("level");
            Integer clanID      = (Integer) row.get("guild");
            long lastLogin      = (Integer) row.get("lastTimeOnline");

            // Execute INSERT
            postgresJdbcTemplate.update(
                    "INSERT INTO ltfg.characters (char_game_id, character_name, platformId, level, " +
                            "game_id, clan_id, last_login_date) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                            "ON CONFLICT (char_game_id) DO UPDATE SET " +
                            "character_name = EXCLUDED.character_name, " +
                            "platformId = EXCLUDED.platformId, " +
                            "level = EXCLUDED.level, " +
                            "game_id = EXCLUDED.game_id, " +
                            "clan_id = EXCLUDED.clan_id, " +
                            "last_login_date = EXCLUDED.last_login_date",
                    id, charName, platformID, level, 1, clanID, epochToTimestamp(lastLogin));

        }
    }

    public void transferClanData() {

        logger.debug("transferClanData() called");
        // Get everything from the guilds table
        List<Map<String, Object>> results = sqliteJdbcTemplate.queryForList("SELECT * FROM main.guilds");

        for (Map<String, Object> row : results) {
            Integer id          = (Integer) row.get("guildId");
            String clanName     = (String) row.get("name");
            String message      = (String) row.get("messageOfTheDay");
            Integer owner       = (Integer) row.get("owner");

            // Execute INSERT
            postgresJdbcTemplate.update(
                    "INSERT INTO ltfg.clan_metrics (clan_id, clan_name, message_of_the_day, owner_id) " +
                            "VALUES (?, ?, ?, ?) " +
                            "ON CONFLICT (clan_id) DO UPDATE SET " +
                            "clan_name = EXCLUDED.clan_name, " +
                            "message_of_the_day = EXCLUDED.message_of_the_day, " +
                            "owner_id = EXCLUDED.owner_id",
                    id, clanName, message, owner);

        }
    }

//    public void transferGameEventData() {
//        List<Map<String, Object>> results = sqliteJdbcTemplate.queryForList("SELECT * FROM game_event_data");
//        for (Map<String, Object> row : results) {
//            String eventName = (String) row.get("event_name");
//            String description = (String) row.get("description");
//            postgresJdbcTemplate.update("INSERT INTO game_event_data (event_name, description) VALUES (?, ?)", eventName, description);
//        }
//    }
//
    public void transferBuildingData() {

        List<Map<String, Object>> results = sqliteJdbcTemplate.queryForList(
                "select DISTINCT  g.guildid, (\n" +
                "    select count() from building_instances\n" +
                "    where object_id in (\n" +
                "        select object_id from buildings\n" +
                "        where owner_id = g.guildId)) as count\n" +
                "FROM guilds as g\n" +
                "    LEFT JOIN buildings as b\n" +
                "        ON b.owner_id = g.guildId\n" +
                "ORDER BY count DESC;");

        for (Map<String, Object> row : results) {
            Integer guildId = (Integer) row.get("guildId");
            Integer count = (Integer) row.get("count");
            postgresJdbcTemplate.update(
                    "UPDATE ltfg.clan_metrics " +
                            "SET placed_building_count = ? " +
                            "WHERE clan_id = ?",
                    count, guildId);
        }
    }

    public void transferItemInventoryData() {
        List<Map<String, Object>> results = sqliteJdbcTemplate.queryForList(
                "SELECT g.guildid, g.name, count(*) as InventoryCount\n" +
                        "FROM Detailed_structure_inventory as dsi\n" +
                        "         JOIN buildings as b on dsi.owner_id = b.object_id\n" +
                        "         JOIN guilds as g on b.owner_id = g.guildId\n" +
                        "GROUP BY g.guildId, g.name\n" +
                        "ORDER BY InventoryCount DESC;");

        for (Map<String, Object> row : results) {
            Integer guildId = (Integer) row.get("guildId");
            Integer count = (Integer) row.get("InventoryCount");
            postgresJdbcTemplate.update(
                    "UPDATE ltfg.clan_metrics " +
                            "SET inventory_count = ? " +
                            "WHERE clan_id = ?",
                    count, guildId);

        }
    }

    public static Timestamp epochToTimestamp(long epochTime) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date(epochTime*1000);
        String myDate = format.format(date);
        Date parsedDate = format.parse(myDate);
        Timestamp timestamp = new Timestamp(parsedDate.getTime());
        return timestamp;
    }
}
