package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentDTO;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class StudentServiceTest {
    private static final Long ID = 1L;
    private static final String FIRST_NAME = "Alice";
    private static final String LAST_NAME = "Martin";
    private static final String EMAIL = "alice.martin@biblio.fr";

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentMapper studentMapper;
    @InjectMocks
    private StudentService studentService;

    private Student buildStudent() {
        Student student = new Student();
        student.setId(ID);
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);
        return student;
    }

    private StudentRequestDTO buildRequest() {
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(FIRST_NAME);
        request.setLastName(LAST_NAME);
        request.setEmail(EMAIL);
        return request;
    }

    private StudentDTO buildDto() {
        StudentDTO dto = new StudentDTO();
        dto.setId(ID);
        dto.setFirstName(FIRST_NAME);
        dto.setLastName(LAST_NAME);
        dto.setEmail(EMAIL);
        return dto;
    }

    @Test
    public void test_create_student_returns_dto() {
        // GIVEN
        Student student = buildStudent();
        StudentRequestDTO request = buildRequest();
        StudentDTO dto = buildDto();
        when(studentMapper.toEntity(request)).thenReturn(student);
        when(studentRepository.save(student)).thenReturn(student);
        when(studentMapper.toDto(student)).thenReturn(dto);

        // WHEN
        StudentDTO result = studentService.create(request);

        // THEN
        verify(studentRepository).save(student);
        assertThat(result).isEqualTo(dto);
    }

    @Test
    public void test_find_all_returns_dto_list() {
        // GIVEN
        Student student = buildStudent();
        List<StudentDTO> dtos = List.of(buildDto());
        when(studentRepository.findAll()).thenReturn(List.of(student));
        when(studentMapper.toDtoList(List.of(student))).thenReturn(dtos);

        // WHEN
        List<StudentDTO> result = studentService.findAll();

        // THEN
        assertThat(result).isEqualTo(dtos);
    }

    @Test
    public void test_find_by_id_returns_dto() {
        // GIVEN
        Student student = buildStudent();
        StudentDTO dto = buildDto();
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));
        when(studentMapper.toDto(student)).thenReturn(dto);

        // WHEN
        StudentDTO result = studentService.findById(ID);

        // THEN
        assertThat(result).isEqualTo(dto);
    }

    @Test
    public void test_find_by_id_not_found_throws_EntityNotFoundException() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.empty());

        // THEN
        Assertions.assertThrows(EntityNotFoundException.class,
                () -> studentService.findById(ID));
    }

    @Test
    public void test_update_student_returns_dto() {
        // GIVEN
        Student student = buildStudent();
        StudentRequestDTO request = buildRequest();
        StudentDTO dto = buildDto();
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));
        when(studentRepository.save(student)).thenReturn(student);
        when(studentMapper.toDto(student)).thenReturn(dto);

        // WHEN
        StudentDTO result = studentService.update(ID, request);

        // THEN
        verify(studentMapper).updateEntityFromDto(request, student);
        verify(studentRepository).save(student);
        assertThat(result).isEqualTo(dto);
    }

    @Test
    public void test_delete_student_calls_repository() {
        // GIVEN
        Student student = buildStudent();
        when(studentRepository.findById(ID)).thenReturn(Optional.of(student));

        // WHEN
        studentService.delete(ID);

        // THEN
        verify(studentRepository).delete(student);
    }

    @Test
    public void test_delete_not_found_throws_EntityNotFoundException() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.empty());

        // THEN
        Assertions.assertThrows(EntityNotFoundException.class,
                () -> studentService.delete(ID));
    }
}
