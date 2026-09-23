package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	CookieSecure   bool
	FrontendOrigin string
	AdminEmail     string
}

func Load() Config {
	return Config{
		Port:           env("PORT", "8080"),
		DatabaseURL:    env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/baba_pustak_bhandar?sslmode=disable"),
		JWTSecret:      env("JWT_SECRET", "dev-secret-change-me"),
		CookieSecure:   envBool("COOKIE_SECURE", false),
		FrontendOrigin: env("FRONTEND_ORIGIN", "http://localhost:3000"),
		AdminEmail:     env("ADMIN_EMAIL", "admin@bpb.local"),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}
