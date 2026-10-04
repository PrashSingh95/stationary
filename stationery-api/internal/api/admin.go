package api

import (
	"math"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type productWriteRequest struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Slug            string   `json:"slug"`
	Description     string   `json:"description"`
	Category        string   `json:"category"`
	Brand           string   `json:"brand"`
	Price           int      `json:"price"`
	OriginalPrice   *int     `json:"originalPrice"`
	DiscountPercent int      `json:"discountPercent"`
	Images          []string `json:"images"`
	Specs           []string `json:"specs"`
	StockQuantity   int      `json:"stockQuantity"`
	Featured        bool     `json:"featured"`
	Popular         bool     `json:"popular"`
	Active          bool     `json:"active"`
}

type statusRequest struct {
	Status string `json:"status"`
}

func (s *Server) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, err := s.getUser(r.Context(), userIDFromContext(r.Context()))
		if err != nil || user.Role != "admin" {
			writeError(w, http.StatusForbidden, "ADMIN_REQUIRED", "Admin access is required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) adminListOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := s.loadOrders(r, `order by o.created_at desc`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_QUERY_FAILED", "Could not load orders")
		return
	}
	writeJSON(w, http.StatusOK, orders)
}

func (s *Server) adminUpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	var request statusRequest
	if err := decodeJSON(r, &request); err != nil || !validOrderStatus(request.Status) {
		writeError(w, http.StatusBadRequest, "INVALID_STATUS", "Invalid order status")
		return
	}

	_, err := s.db.Exec(
		r.Context(),
		`update orders set status = $1, updated_at = now() where id = $2`,
		request.Status,
		chi.URLParam(r, "id"),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_UPDATE_FAILED", "Could not update order")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": request.Status})
}

func (s *Server) adminCreateProduct(w http.ResponseWriter, r *http.Request) {
	request, ok := validProductWriteRequest(w, r)
	if !ok {
		return
	}
	if request.ID == "" {
		request.ID = "p-" + request.Slug
	}

	var product productResponse
	var originalPrice pgtype.Int4
	err := s.db.QueryRow(
		r.Context(),
		`insert into products (id, name, slug, description, category_slug, brand, price, original_price, discount_percent, images, specs, stock_quantity, is_featured, is_popular, is_active)
		 values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
		 returning id, name, slug, description, category_slug, brand, price, original_price, discount_percent, images, (stock_quantity > 0), is_featured, is_popular, specs, stock_quantity`,
		request.ID,
		request.Name,
		request.Slug,
		request.Description,
		request.Category,
		request.Brand,
		request.Price,
		request.OriginalPrice,
		request.DiscountPercent,
		request.Images,
		request.Specs,
		request.StockQuantity,
		request.Featured,
		request.Popular,
	).Scan(&product.ID, &product.Name, &product.Slug, &product.Description, &product.Category, &product.Brand, &product.Price, &originalPrice, &product.DiscountPercent, &product.Images, &product.InStock, &product.Featured, &product.Popular, &product.Specs, &product.StockQuantity)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_CREATE_FAILED", "Could not create product")
		return
	}
	if originalPrice.Valid {
		price := int(originalPrice.Int32)
		product.OriginalPrice = &price
	}

	writeJSON(w, http.StatusCreated, product)
}

func (s *Server) adminUpdateProduct(w http.ResponseWriter, r *http.Request) {
	request, ok := validProductWriteRequest(w, r)
	if !ok {
		return
	}

	_, err := s.db.Exec(
		r.Context(),
		`update products
		 set name = $1, slug = $2, description = $3, category_slug = $4, brand = $5,
		     price = $6, original_price = $7, discount_percent = $8, images = $9, specs = $10, stock_quantity = $11,
		     is_featured = $12, is_popular = $13, is_active = $14, updated_at = now()
		 where id = $15`,
		request.Name,
		request.Slug,
		request.Description,
		request.Category,
		request.Brand,
		request.Price,
		request.OriginalPrice,
		request.DiscountPercent,
		request.Images,
		request.Specs,
		request.StockQuantity,
		request.Featured,
		request.Popular,
		request.Active,
		chi.URLParam(r, "id"),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_UPDATE_FAILED", "Could not update product")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (s *Server) adminDeleteProduct(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(r.Context(), `update products set is_active = false, updated_at = now() where id = $1`, chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_DELETE_FAILED", "Could not delete product")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (s *Server) adminInventory(w http.ResponseWriter, r *http.Request) {
	products, err := s.queryProducts(
		r,
		`select p.id, p.name, p.slug, p.description, p.category_slug, p.brand,
		        p.price, p.original_price, p.discount_percent, p.images, (p.stock_quantity > 0) as in_stock,
		        p.is_featured, p.is_popular, p.specs, p.stock_quantity
		 from products p
		 order by p.stock_quantity asc, p.name asc`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "INVENTORY_QUERY_FAILED", "Could not load inventory")
		return
	}
	writeJSON(w, http.StatusOK, products)
}

func validOrderStatus(status string) bool {
	switch status {
	case "PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED":
		return true
	default:
		return false
	}
}

func validProductWriteRequest(w http.ResponseWriter, r *http.Request) (productWriteRequest, bool) {
	var request productWriteRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_PRODUCT", "Invalid product request")
		return request, false
	}

	request.Name = strings.TrimSpace(request.Name)
	request.Slug = strings.TrimSpace(request.Slug)
	request.Category = strings.TrimSpace(request.Category)
	request.Brand = strings.TrimSpace(request.Brand)

	if request.Name == "" || request.Slug == "" || request.Category == "" || request.Brand == "" || request.Price < 0 {
		writeError(w, http.StatusBadRequest, "INVALID_PRODUCT", "Name, slug, category, brand, and price are required")
		return request, false
	}
	if request.DiscountPercent < 0 || request.DiscountPercent > 100 {
		writeError(w, http.StatusBadRequest, "INVALID_PRODUCT_DISCOUNT", "Discount must be between 0 and 100")
		return request, false
	}
	applyProductDiscount(&request)
	if request.Images == nil {
		request.Images = []string{"default"}
	}
	if request.Specs == nil {
		request.Specs = []string{}
	}

	return request, true
}

func applyProductDiscount(request *productWriteRequest) {
	if request.DiscountPercent <= 0 {
		if request.OriginalPrice != nil && *request.OriginalPrice <= request.Price {
			request.OriginalPrice = nil
		}
		return
	}

	mrp := request.Price
	if request.OriginalPrice != nil {
		mrp = *request.OriginalPrice
	}

	if mrp < 0 {
		mrp = 0
	}

	request.OriginalPrice = &mrp
	request.Price = int(math.Round(float64(mrp) * (100 - float64(request.DiscountPercent)) / 100))
}
