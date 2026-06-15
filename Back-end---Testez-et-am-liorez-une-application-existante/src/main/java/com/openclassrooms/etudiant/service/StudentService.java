package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentDTO;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentDTO create(StudentRequestDTO studentRequestDTO) {
        log.info("Creating new student");
        Student student = studentMapper.toEntity(studentRequestDTO);
        return studentMapper.toDto(studentRepository.save(student));
    }

    public List<StudentDTO> findAll() {
        log.info("Fetching all students");
        return studentMapper.toDtoList(studentRepository.findAll());
    }

    public StudentDTO findById(Long id) {
        log.info("Fetching student {}", id);
        return studentMapper.toDto(getStudentOrThrow(id));
    }

    public StudentDTO update(Long id, StudentRequestDTO studentRequestDTO) {
        log.info("Updating student {}", id);
        Student student = getStudentOrThrow(id);
        studentMapper.updateEntityFromDto(studentRequestDTO, student);
        return studentMapper.toDto(studentRepository.save(student));
    }

    public void delete(Long id) {
        log.info("Deleting student {}", id);
        Student student = getStudentOrThrow(id);
        studentRepository.delete(student);
    }

    private Student getStudentOrThrow(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + id));
    }
}
