package com.skillswap.repository;

import com.skillswap.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserId(Long userId);
    List<UserSkill> findByUserIdAndType(Long userId, String type);
    List<UserSkill> findBySkillIdAndType(Long skillId, String type);
    Optional<UserSkill> findByUserIdAndSkillIdAndType(Long userId, Long skillId, String type);
    void deleteByUserIdAndSkillIdAndType(Long userId, Long skillId, String type);
}
