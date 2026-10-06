package com.campuscircular.backend.entity;
import jakarta.persistence.*;
@Entity @Table(name = "need_templates")
public class NeedTemplate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String triggerKeywords;
    private String requiredItemTypes;
    private String optionalItemTypes;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getTriggerKeywords() { return triggerKeywords; } public void setTriggerKeywords(String triggerKeywords) { this.triggerKeywords = triggerKeywords; }
    public String getRequiredItemTypes() { return requiredItemTypes; } public void setRequiredItemTypes(String requiredItemTypes) { this.requiredItemTypes = requiredItemTypes; }
    public String getOptionalItemTypes() { return optionalItemTypes; } public void setOptionalItemTypes(String optionalItemTypes) { this.optionalItemTypes = optionalItemTypes; }
}
