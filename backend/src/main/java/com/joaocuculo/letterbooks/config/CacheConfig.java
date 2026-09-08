package com.joaocuculo.letterbooks.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        cacheManager.registerCustomCache(
                "googleBooksSearch",
                Caffeine.newBuilder()
                        .maximumSize(300)
                        .expireAfterWrite(Duration.ofMinutes(30))
                        .recordStats()
                        .build()
        );

        cacheManager.registerCustomCache(
                "googleBooksVolume",
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(Duration.ofHours(24))
                        .recordStats()
                        .build()
        );

        return cacheManager;
    }
}
