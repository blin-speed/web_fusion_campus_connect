package com.campuscircular.backend.entity;
import jakarta.persistence.*;
@Entity @Table(name = "settings")
public class Setting {
    @Id private String key;
    private String value;
    public String getKey() { return key; } public void setKey(String key) { this.key = key; }
    public String getValue() { return value; } public void setValue(String value) { this.value = value; }
}
