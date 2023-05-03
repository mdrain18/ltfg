package com.lessons.models.preferences;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SetPreferenceDTO {

    @JsonProperty("name")
    private String name;

    @JsonProperty("value")
    private String value;

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

}




