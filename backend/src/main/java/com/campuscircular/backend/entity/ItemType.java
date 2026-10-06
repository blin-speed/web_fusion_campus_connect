package com.campuscircular.backend.entity;
import jakarta.persistence.*;
@Entity @Table(name = "item_types")
public class ItemType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "category_id") private Category category;
    private String name;
    private String keywords;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Category getCategory() { return category; } public void setCategory(Category category) { this.category = category; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getKeywords() { return keywords; } public void setKeywords(String keywords) { this.keywords = keywords; }
}
