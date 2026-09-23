package api

import (
	"log/slog"
	"net/http"

	"baba-pustak-bhandar-api/config"
	appmw "baba-pustak-bhandar-api/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	db     *pgxpool.Pool
	config config.Config
	logger *slog.Logger
}

func NewServer(db *pgxpool.Pool, cfg config.Config, logger *slog.Logger) *Server {
	return &Server{db: db, config: cfg, logger: logger}
}

func (s *Server) Routes() http.Handler {
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(appmw.Logging(s.logger))
	router.Use(appmw.CORS(s.config.FrontendOrigin))

	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	router.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", s.register)
			r.Post("/login", s.login)
			r.Post("/logout", s.logout)
			r.Get("/me", s.me)
		})

		r.Get("/products", s.listProducts)
		r.Get("/products/{slug}", s.getProduct)
		r.Get("/categories", s.listCategories)
		r.Get("/categories/{slug}", s.getCategory)
		r.Get("/categories/{slug}/products", s.getCategoryProducts)

		r.Route("/cart", func(r chi.Router) {
			r.Use(s.requireAuth)
			r.Get("/", s.getCart)
			r.Post("/items", s.addCartItem)
			r.Patch("/items/{id}", s.updateCartItem)
			r.Delete("/items/{id}", s.deleteCartItem)
			r.Delete("/", s.clearCart)
		})

		r.Route("/addresses", func(r chi.Router) {
			r.Use(s.requireAuth)
			r.Get("/", s.listAddresses)
			r.Post("/", s.createAddress)
			r.Patch("/{id}", s.updateAddress)
			r.Delete("/{id}", s.deleteAddress)
		})

		r.Route("/orders", func(r chi.Router) {
			r.Use(s.requireAuth)
			r.Post("/", s.createOrder)
			r.Get("/", s.listOrders)
			r.Get("/{id}", s.getOrder)
			r.Post("/{id}/cancel", s.cancelOrder)
		})

		r.Route("/admin", func(r chi.Router) {
			r.Use(s.requireAuth)
			r.Use(s.requireAdmin)
			r.Get("/orders", s.adminListOrders)
			r.Patch("/orders/{id}/status", s.adminUpdateOrderStatus)
			r.Post("/products", s.adminCreateProduct)
			r.Patch("/products/{id}", s.adminUpdateProduct)
			r.Delete("/products/{id}", s.adminDeleteProduct)
			r.Get("/inventory", s.adminInventory)
		})
	})

	return router
}
