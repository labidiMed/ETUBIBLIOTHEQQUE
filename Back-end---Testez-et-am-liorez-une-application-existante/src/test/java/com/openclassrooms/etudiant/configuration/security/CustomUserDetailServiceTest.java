package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de CustomUserDetailService (chargement d'un utilisateur pour Spring Security).
 * Le repository est mocke.
 */
@ExtendWith(SpringExtension.class)
public class CustomUserDetailServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    @Test
    public void loadUserByUsername_returns_user_when_found() {
        // GIVEN un utilisateur present en base
        User user = new User();
        user.setLogin("jdoe");
        when(userRepository.findByLogin("jdoe")).thenReturn(Optional.of(user));

        // WHEN
        UserDetails result = customUserDetailService.loadUserByUsername("jdoe");

        // THEN le UserDetails retourne porte le bon login
        assertThat(result.getUsername()).isEqualTo("jdoe");
    }

    @Test
    public void loadUserByUsername_throws_when_not_found() {
        // GIVEN aucun utilisateur pour ce login
        when(userRepository.findByLogin("ghost")).thenReturn(Optional.empty());

        // THEN une exception UsernameNotFoundException est levee
        assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailService.loadUserByUsername("ghost"));
    }
}
