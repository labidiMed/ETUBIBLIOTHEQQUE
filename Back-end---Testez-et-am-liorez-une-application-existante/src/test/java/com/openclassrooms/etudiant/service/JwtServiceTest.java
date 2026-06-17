package com.openclassrooms.etudiant.service;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Tests unitaires de JwtService.
 * JwtService n'a pas de dependance a mocker : on l'instancie directement avec un secret et une duree.
 */
public class JwtServiceTest {

    private static final String SECRET = "secret-de-test-suffisamment-long-pour-la-signature-1234567890";
    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    public void setUp() {
        // Token valide 1 heure
        jwtService = new JwtService(SECRET, 3600000L);
        userDetails = new User("jdoe", "password", Collections.emptyList());
    }

    @Test
    public void generateToken_then_extractUsername_returns_the_subject() {
        // Le token genere doit encapsuler le login (subject) et etre relisible
        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("jdoe");
    }

    @Test
    public void isTokenValid_returns_true_when_user_matches() {
        // Un token est valide si son subject correspond a l'utilisateur fourni
        String token = jwtService.generateToken(userDetails);

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    public void isTokenValid_returns_false_when_user_differs() {
        // Un token n'est pas valide pour un autre utilisateur
        String token = jwtService.generateToken(userDetails);
        UserDetails other = new User("autre", "password", Collections.emptyList());

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    public void extractUsername_on_expired_token_throws() {
        // Token deja expire (duree negative) : la lecture doit lever ExpiredJwtException
        JwtService expiringService = new JwtService(SECRET, -1000L);
        String expiredToken = expiringService.generateToken(userDetails);

        assertThrows(ExpiredJwtException.class,
                () -> expiringService.extractUsername(expiredToken));
    }
}
