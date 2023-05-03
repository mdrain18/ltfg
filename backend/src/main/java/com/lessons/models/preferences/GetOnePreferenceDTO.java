package com.lessons.models.preferences;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GetOnePreferenceDTO {

    @JsonProperty("value")
    private final String value;

    // ------------------------------- Constructor & Getters ---------------------------------------

    public GetOnePreferenceDTO(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

}

