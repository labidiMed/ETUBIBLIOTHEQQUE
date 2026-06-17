package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'integration du StudentController (chaine complete controller -> service -> repository -> MySQL).
 * Une base MySQL reelle est demarree via Testcontainers.
 * Les routes etant securisees, chaque appel nominal porte un token JWT (Bearer) genere pour un utilisateur en base.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:8.4");

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    private String bearer;

    @BeforeEach
    public void setUp() {
        // Cree un utilisateur en base : le filtre JWT recharge l'utilisateur par son login a chaque requete
        User user = new User();
        user.setFirstName("Agent");
        user.setLastName("Biblio");
        user.setLogin("agent");
        user.setPassword(passwordEncoder.encode("password"));
        userRepository.save(user);
        // Genere un token Bearer valide pour cet utilisateur
        bearer = "Bearer " + jwtService.generateToken(user);
    }

    @AfterEach
    public void tearDown() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String studentJson(String firstName, String lastName, String email) throws Exception {
        StudentRequestDTO dto = new StudentRequestDTO();
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setEmail(email);
        return objectMapper.writeValueAsString(dto);
    }

    private Student saveStudent(String firstName, String lastName, String email) {
        return studentRepository.save(Student.builder()
                .firstName(firstName).lastName(lastName).email(email).build());
    }

    @Test
    public void createStudent_returns201_andStudentDto() throws Exception {
        // Creation d'un etudiant -> 201 et le DTO retourne contient un id et les bons champs
        mockMvc.perform(post("/api/students")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentJson("Marie", "Curie", "marie.curie@biblio.fr")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("Marie"))
                .andExpect(jsonPath("$.lastName").value("Curie"))
                .andExpect(jsonPath("$.email").value("marie.curie@biblio.fr"));
    }

    @Test
    public void getAllStudents_returns200_andList() throws Exception {
        // Lister les etudiants -> 200 avec la liste attendue
        saveStudent("Marie", "Curie", "marie@biblio.fr");
        saveStudent("Louis", "Pasteur", "louis@biblio.fr");

        mockMvc.perform(get("/api/students").header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void getStudentById_returns200_andStudent() throws Exception {
        // Consulter un etudiant existant -> 200 avec ses informations
        Student saved = saveStudent("Marie", "Curie", "marie@biblio.fr");

        mockMvc.perform(get("/api/students/" + saved.getId()).header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.firstName").value("Marie"));
    }

    @Test
    public void updateStudent_returns200_withUpdatedValues() throws Exception {
        // Modifier un etudiant existant -> 200 avec les nouvelles valeurs
        Student saved = saveStudent("Old", "Name", "old@biblio.fr");

        mockMvc.perform(put("/api/students/" + saved.getId())
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentJson("New", "Name", "new@biblio.fr")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("New"))
                .andExpect(jsonPath("$.email").value("new@biblio.fr"));
    }

    @Test
    public void deleteStudent_returns204() throws Exception {
        // Supprimer un etudiant existant -> 204 (no content)
        Student saved = saveStudent("Marie", "Curie", "marie@biblio.fr");

        mockMvc.perform(delete("/api/students/" + saved.getId()).header("Authorization", bearer))
                .andExpect(status().isNoContent());
    }

    @Test
    public void getAllStudents_withoutToken_returns401() throws Exception {
        // Sans token, l'acces aux routes protegees est refuse -> 401
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void getStudentById_notFound_returns404() throws Exception {
        // Consulter un etudiant inexistant -> 404
        mockMvc.perform(get("/api/students/99999").header("Authorization", bearer))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createStudent_withInvalidBody_returns400() throws Exception {
        // Corps invalide (champs vides, email non valide) -> 400
        mockMvc.perform(post("/api/students")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentJson("", "", "pas-un-email")))
                .andExpect(status().isBadRequest());
    }
}
