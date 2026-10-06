package com.campuscircular.backend.security;

import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthInterceptor(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) return true;
        String uri = request.getRequestURI();
        
        // Public endpoints
        if (uri.startsWith("/api/v1/auth") || uri.startsWith("/api/v1/files") || uri.equals("/api/v1/locations") || 
            (request.getMethod().equalsIgnoreCase("GET") && uri.startsWith("/api/v1/posts")) ||
            uri.startsWith("/api/v1/discover/compare") || uri.startsWith("/api/v1/impact") ||
            (request.getMethod().equalsIgnoreCase("GET") && uri.equals("/api/v1/demand-requests")) ||
            (request.getMethod().equalsIgnoreCase("GET") && uri.startsWith("/api/v1/users"))) {
            return true;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\":{\"code\":\"UNAUTHENTICATED\",\"message\":\"Missing token\"}}");
            return false;
        }

        String token = header.substring(7);
        Long userId = jwtUtils.validateAndGetUserId(token);
        String role = jwtUtils.validateAndGetRole(token);

        if (userId == null || role == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\":{\"code\":\"UNAUTHENTICATED\",\"message\":\"Invalid token\"}}");
            return false;
        }

        if (uri.startsWith("/api/v1/admin") && !"admin".equals(role)) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("{\"error\":{\"code\":\"FORBIDDEN\",\"message\":\"Admin access required\"}}");
            return false;
        }

        if (!"admin".equals(role)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                return false;
            }
            if ("suspended".equals(user.getVerificationStatus()) && !request.getMethod().equalsIgnoreCase("GET")) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("{\"error\":{\"code\":\"SUSPENDED\",\"message\":\"Account suspended\"}}");
                return false;
            }
        }

        AuthContext.setUserId(userId);
        AuthContext.setRole(role);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuthContext.clear();
    }
}
