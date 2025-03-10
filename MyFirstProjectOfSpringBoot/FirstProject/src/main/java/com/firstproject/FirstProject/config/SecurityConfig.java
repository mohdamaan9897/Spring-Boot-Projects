package com.firstproject.FirstProject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers("/api/products/add", "/api/products/update/", "/api/products/delete/").hasRole("ADMIN") // Only admin can perform CRUD operations
                        .requestMatchers("/api/bills/").authenticated() // Only logged-in users (admin or user) can access bill-related endpoints
                        .requestMatchers("/api/").permitAll() // Allow access to all other /api endpoints
                        .anyRequest().authenticated() // Secure all other endpoints
                )
                .httpBasic(); // Use HTTP Basic authentication

        return http.build();
    }
    @Bean
    public UserDetailsService userDetailsService() {
        // Create an admin user
        UserDetails admin = User.withDefaultPasswordEncoder()
                .username("admin")
                .password("admin123")
                .roles("ADMIN")
                .build();

        // Create a regular user
        UserDetails user = User.withDefaultPasswordEncoder()
                .username("user")
                .password("user123")
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user);
    }
}
