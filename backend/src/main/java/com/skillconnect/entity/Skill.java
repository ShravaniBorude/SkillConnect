package com.skillconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "skills")
public class Skill extends BaseEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "category_hint", length = 100)
    private String categoryHint;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getCategoryHint() {
        return categoryHint;
    }

    public void setCategoryHint(String categoryHint) {
        this.categoryHint = categoryHint;
    }
}
