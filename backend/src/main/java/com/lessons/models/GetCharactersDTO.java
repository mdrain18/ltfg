package com.lessons.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sun.corba.se.spi.ior.Identifiable;
import org.omg.CORBA_2_3.portable.OutputStream;

public class GetCharactersDTO implements Identifiable {

    @JsonProperty("id")
    private int id;

    @JsonProperty("platform_id")
    private String platformId;

    @JsonProperty("character_name")
    private String characterName;

    @JsonProperty("level")
    private Integer level;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("last_login_date")
    private String lastLoginDate;

    @JsonProperty("clan_name")
    private String clanName;

    @JsonProperty("game_name")
    private String gameName;

    @JsonProperty("time_played")
    private String timePlayed;

    @JsonProperty("is_new")
    private String isNew;

    @Override
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPlatformId() {
        return platformId;
    }

    public void setPlatformId(String platformId) {
        this.platformId = platformId;
    }

    public String getCharacterName() {
        return characterName;
    }

    public void setCharacterName(String characterName) {
        this.characterName = characterName;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getLastLoginDate() {
        return lastLoginDate;
    }

    public void setLastLoginDate(String lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public String getClanName() {
        return clanName;
    }

    public void setClanName(String clanName) {
        this.clanName = clanName;
    }

    public String getGameName() {
        return gameName;
    }

    public void setGameName(String gameName) {
        this.gameName = gameName;
    }

    public String getTimePlayed() {
        return timePlayed;
    }

    public void setTimePlayed(String timePlayed) {
        this.timePlayed = timePlayed;
    }

    public String getIsNew() {
        return isNew;
    }

    public void setIsNew(String isNew) {
        this.isNew = isNew;
    }

    @Override
    public void write(OutputStream arg0) {

    }
}