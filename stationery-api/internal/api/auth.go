package api

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type contextKey string

const (
	authCookieName = "bpb_session"
	userIDKey      = contextKey("user_id")
)

type authRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	CreatedAt string `json:"createdAt"`
}

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var request authRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid registration request")
		return
	}

	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.Name = strings.TrimSpace(request.Name)
	if request.Name == "" || request.Email == "" || len(request.Password) < 8 {
		writeError(w, http.StatusBadRequest, "INVALID_REGISTRATION", "Name, email, and an 8 character password are required")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PASSWORD_HASH_FAILED", "Could not create account")
		return
	}

	role := "customer"
	if request.Email == strings.ToLower(strings.TrimSpace(s.config.AdminEmail)) {
		role = "admin"
	}

	var user userResponse
	err = s.db.QueryRow(
		r.Context(),
		`insert into users (name, email, password_hash, role)
		 values ($1, $2, $3, $4)
		 returning id::text, name, email, role, created_at::text`,
		request.Name,
		request.Email,
		string(hash),
		role,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusConflict, "ACCOUNT_EXISTS", "An account with this email already exists")
		return
	}

	s.setSessionCookie(w, user.ID)
	writeJSON(w, http.StatusCreated, user)
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var request authRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid login request")
		return
	}

	var user userResponse
	var passwordHash string
	err := s.db.QueryRow(
		r.Context(),
		`select id::text, name, email, role, created_at::text, password_hash
		 from users
		 where email = $1`,
		strings.ToLower(strings.TrimSpace(request.Email)),
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt, &passwordHash)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(request.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect")
		return
	}

	s.setSessionCookie(w, user.ID)
	writeJSON(w, http.StatusOK, user)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   s.config.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
	writeJSON(w, http.StatusOK, map[string]bool{"loggedOut": true})
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	userID, err := s.userIDFromRequest(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please log in")
		return
	}

	user, err := s.getUser(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please log in")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (s *Server) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, err := s.userIDFromRequest(r)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please log in")
			return
		}

		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userIDKey, userID)))
	})
}

func userIDFromContext(ctx context.Context) string {
	if value, ok := ctx.Value(userIDKey).(string); ok {
		return value
	}
	return ""
}

func (s *Server) setSessionCookie(w http.ResponseWriter, userID string) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})
	signed, _ := token.SignedString([]byte(s.config.JWTSecret))

	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    signed,
		Path:     "/",
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   s.config.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *Server) userIDFromRequest(r *http.Request) (string, error) {
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		return "", errUnauthorized
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (any, error) {
		return []byte(s.config.JWTSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil || !token.Valid {
		return "", errUnauthorized
	}

	subject, err := token.Claims.GetSubject()
	if err != nil || subject == "" {
		return "", errUnauthorized
	}
	return subject, nil
}

func (s *Server) getUser(ctx context.Context, userID string) (userResponse, error) {
	var user userResponse
	err := s.db.QueryRow(
		ctx,
		`select id::text, name, email, role, created_at::text
		 from users
		 where id = $1`,
		userID,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
	if err == pgx.ErrNoRows {
		return user, errUnauthorized
	}
	return user, err
}
