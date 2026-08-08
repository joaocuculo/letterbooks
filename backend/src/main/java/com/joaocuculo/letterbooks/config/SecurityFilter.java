package com.joaocuculo.letterbooks.config;

import com.joaocuculo.letterbooks.entities.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.logging.log4j.util.Strings;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenConfig tokenConfig;
    private final AuthorizationService authorizationService;

    public SecurityFilter(TokenConfig tokenConfig, AuthorizationService authorizationService) {
        this.tokenConfig = tokenConfig;
        this.authorizationService = authorizationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizedHeader = request.getHeader("Authorization");

        if (Strings.isNotEmpty(authorizedHeader) && authorizedHeader.startsWith("Bearer ")) {
            String token = authorizedHeader.substring("Bearer ".length());
            var optUser = tokenConfig.validateToken(token);

            if (optUser.isPresent()) {
                JWTUserData userData = optUser.get();

                try {
                    // Carregar usuário atualizado do banco de dados pelo ID do token
                    User loadedUser = (User) authorizationService.loadUserById(userData.userId());

                    // Validar se usuário está habilitado (não inativo)
                    if (!loadedUser.isEnabled()) {
                        // Usuário inativo - não autenticar
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Reconstruir JWTUserData com dados ATUALIZADOS do banco
                    JWTUserData updatedUserData = new JWTUserData(
                            loadedUser.getId(),
                            loadedUser.getEmail(),
                            loadedUser.getRole()
                    );

                    // Criar autenticação com authorities do usuário carregado (reflete role ATUAL)
                    var authorities = loadedUser.getAuthorities();
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(updatedUserData, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                } catch (UsernameNotFoundException e) {
                    // Usuário não encontrado - não autenticar
                    SecurityContextHolder.clearContext();
                }
            }
            filterChain.doFilter(request, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }
}
