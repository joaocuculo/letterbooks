package com.joaocuculo.letterbooks.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.joaocuculo.letterbooks.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class TokenConfig {

    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("letterbooks")
                    .withSubject(user.getId().toString())
                    .withClaim("userEmail", user.getEmail())
                    .withExpiresAt(Instant.now().plusSeconds(60 * 60 * 2)) // 2 horas
                    .withIssuedAt(Instant.now())
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new RuntimeException("Error while generate token", e);
        }
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decode = JWT.require(algorithm)
                    .withIssuer("letterbooks")
                    .build()
                    .verify(token);
            return Optional.of(new JWTUserData(
                    Long.parseLong(decode.getSubject()),
                    decode.getClaim("userEmail").asString()
            ));
        } catch (JWTVerificationException e) {
            return Optional.empty();
        }
    }
}
