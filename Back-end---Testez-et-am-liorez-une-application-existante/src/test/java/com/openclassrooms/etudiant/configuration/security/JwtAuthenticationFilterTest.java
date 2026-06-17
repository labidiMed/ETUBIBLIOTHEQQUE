package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.service.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires du filtre d'authentification JWT.
 * JwtService et CustomUserDetailService sont mockes.
 */
@ExtendWith(SpringExtension.class)
public class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailService customUserDetailService;
    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @AfterEach
    public void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void valid_bearer_token_authenticates_the_user() throws Exception {
        // GIVEN un token valide pour l'utilisateur "jdoe"
        User user = new User();
        user.setLogin("jdoe");
        when(jwtService.extractUsername("good-token")).thenReturn("jdoe");
        when(customUserDetailService.loadUserByUsername("jdoe")).thenReturn(user);
        when(jwtService.isTokenValid("good-token", user)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer good-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN l'utilisateur est authentifie dans le contexte de securite
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("jdoe");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void no_authorization_header_does_not_authenticate() throws Exception {
        // GIVEN aucune en-tete Authorization
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN aucune authentification, mais la chaine continue
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void invalid_token_does_not_authenticate() throws Exception {
        // GIVEN un token invalide (la lecture leve une exception)
        when(jwtService.extractUsername("bad-token")).thenThrow(new RuntimeException("invalide"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN aucune authentification, la chaine continue quand meme
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
