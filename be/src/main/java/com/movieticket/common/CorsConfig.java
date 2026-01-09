package com.movieticket.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
  
  // CORS cho Render deployment
  // Cho phép mọi origin để dễ demo (có thể restrict sau)
  @Value("${cors.allowed-origins:*}")
  private String allowedOrigins;
  
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    // Nếu allowedOrigins = "*", dùng allowedOriginPatterns
    if ("*".equals(allowedOrigins)) {
      registry.addMapping("/**")
          .allowedOriginPatterns("*")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true);
    } else {
      // Split multiple origins by comma
      String[] origins = allowedOrigins.split(",");
      registry.addMapping("/**")
          .allowedOrigins(origins)
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true);
    }
  }
}
