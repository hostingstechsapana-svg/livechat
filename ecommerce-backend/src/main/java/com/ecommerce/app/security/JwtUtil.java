package com.ecommerce.app.security;


import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.ecommerce.app.ENUM.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;


@Component
public class JwtUtil {
     private Key key;
     
     @Value("${JWT_SECRET}")
     private String secret;
     
     @Value("${jwt.token.expiration-days:20}")
     private long tokenExpirationDays;
     
     @Value("${jwt.reset.expiration-minutes:15}")
     private long resetTokenExpirationMinutes;
 
     @PostConstruct
     private void setup() {
    	this.key = Keys.hmacShaKeyFor(secret.getBytes()); 
     }   
     
     public String generateToken(Long userId, Role role) {
    	 return Jwts.builder()
    			 .setSubject(String.valueOf(userId))
    			 .claim("role", role.name().toUpperCase())
    			 .setIssuedAt(new Date())
    			 .setExpiration(new Date(System.currentTimeMillis()
    					 +tokenExpirationDays *24*60*60*1000L)) //1day
    			 .signWith(key, SignatureAlgorithm.HS256)
    			 .compact();
     }
     
     public String generateResetToken(String email, Role role) {
    	 return Jwts.builder()
    			 .setSubject(email)
    			 .claim("role", role.name())
    			 .setIssuedAt(new Date())
    			 .setExpiration(new Date(System.currentTimeMillis() 
    					 + resetTokenExpirationMinutes*60*1000L))  //15min
    			 .signWith(key, SignatureAlgorithm.HS256)
    			 .compact();
     }
     
     // extract user id or email from jwt token
     public Long extractUserId(String token) {
         String subject = extractAllClaims(token).getSubject();
         return Long.parseLong(subject);
     }
     
     // extract role from jwt token 
     public String extractRole(String token) {
    	 return extractAllClaims(token).get("role", String.class).toUpperCase().trim();
     }
     
     //check whether token is expired or not 
     public boolean isTokenExpired(String token) {
    	 return extractAllClaims(token).getExpiration().before(new Date());
     }
     
     //validate the token
     public boolean validateToken(String token) {
    	 return  !isTokenExpired(token);
     }
     
     //method to extract all subejct,rokle from token
     public Claims extractAllClaims(String token) {
    	 return Jwts.parserBuilder()
    			 .setSigningKey(key)
    			 .build()
    			 .parseClaimsJws(token)
    			 .getBody();
     }
}
