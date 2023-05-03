package com.lessons.models.preferences;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SetPreferenceWithPageDTO {

    @JsonProperty("name")
    private String name;

    @JsonProperty("value")
    private String value;

    @JsonProperty("page")
    private String page;


    // --------------------- Getters & Setters --------------------------------

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getPage() {
        return page;
    }

    public void setPage(String page) {
        this.page = page;
    }

}
