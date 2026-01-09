package com.movieticket.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
  
  // Đọc CORS origins từ environment variable
  // Local: http://localhost:3000
  // Production: https://your-app.vercel.app
  @Value("${cors.allowed-origins:http://localhost:3000}")
  private String allowedOrigins;
  
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    // Split multiple origins by comma (nếu có nhiều domain)
    String[] origins = allowedOrigins.split(",");
    
    registry.addMapping("/**")
        .allowedOrigins(origins)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
