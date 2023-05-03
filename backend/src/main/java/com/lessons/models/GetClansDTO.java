package com.lessons.models;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.sun.corba.se.spi.ior.Identifiable;
import org.omg.CORBA_2_3.portable.OutputStream;

public class GetClansDTO implements Identifiable {

    @JsonProperty("id")
    private int id;

    @JsonProperty("clanName")
    private String clanName;

    @JsonProperty("messageOfTheDay")
    private String messageOfTheDay;

    @JsonProperty("ownerId")
    private Integer ownerId;

    @JsonProperty("totalMembers")
    private Integer totalMembers;

    @JsonProperty("activeMembers")
    private Integer activeMembers;

    @JsonProperty("memberGrowthRate")
    private String memberGrowthRate;

    @JsonProperty("warWins")
    private Integer warWins;

    @JsonProperty("warLosses")
    private Integer warLosses;

    @JsonProperty("buildingCount")
    private Integer placedBuildingCount;

    @JsonProperty("storedBuildingCount")
    private Integer storedBuildingCount;

    @JsonProperty("inventoryCount")
    private Integer inventoryCount;

    @JsonProperty("clanKDRatio")
    private String clanKDRatio;

    @JsonProperty("lastUpdated")
    private String lastUpdated;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getClanName() {
        return clanName;
    }

    public void setClanName(String clanName) {
        this.clanName = clanName;
    }

    public String getMessageOfTheDay() {
        return messageOfTheDay;
    }

    public void setMessageOfTheDay(String messageOfTheDay) {
        this.messageOfTheDay = messageOfTheDay;
    }

    public Integer getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Integer ownerId) {
        this.ownerId = ownerId;
    }

    public Integer getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(Integer totalMembers) {
        this.totalMembers = totalMembers;
    }

    public Integer getActiveMembers() {
        return activeMembers;
    }

    public void setActiveMembers(Integer activeMembers) {
        this.activeMembers = activeMembers;
    }

    public String getMemberGrowthRate() {
        return memberGrowthRate;
    }

    public void setMemberGrowthRate(String memberGrowthRate) {
        this.memberGrowthRate = memberGrowthRate;
    }

    public Integer getWarWins() {
        return warWins;
    }

    public void setWarWins(Integer warWins) {
        this.warWins = warWins;
    }

    public Integer getWarLosses() {
        return warLosses;
    }

    public void setWarLosses(Integer warLosses) {
        this.warLosses = warLosses;
    }

    public Integer getPlacedBuildingCount() {
        return placedBuildingCount;
    }

    public void setPlacedBuildingCount(Integer placedBuildingCount) {
        this.placedBuildingCount = placedBuildingCount;
    }

    public Integer getStoredBuildingCount() {
        return storedBuildingCount;
    }

    public void setStoredBuildingCount(Integer storedBuildingCount) {
        this.storedBuildingCount = storedBuildingCount;
    }

    public Integer getInventoryCount() {
        return inventoryCount;
    }

    public void setInventoryCount(Integer inventoryCount) {
        this.inventoryCount = inventoryCount;
    }

    public String getClanKDRatio() {
        return clanKDRatio;
    }

    public void setClanKDRatio(String clanKDRatio) {
        this.clanKDRatio = clanKDRatio;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @Override
    public void write(OutputStream arg0) {

    }
}
