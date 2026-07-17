package com.skillswap.repository;

import com.skillswap.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByCategory_Id(Long categoryId);
    Optional<Skill> findByName(String name);
}
