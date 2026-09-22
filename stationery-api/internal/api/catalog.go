package api

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type categoryResponse struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

type productResponse struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Slug          string   `json:"slug"`
	Description   string   `json:"description"`
	Category      string   `json:"category"`
	Brand         string   `json:"brand"`
	Price         int      `json:"price"`
	OriginalPrice *int     `json:"originalPrice,omitempty"`
	Images        []string `json:"images"`
	InStock       bool     `json:"inStock"`
	Featured      bool     `json:"featured"`
	Popular       bool     `json:"popular"`
	Specs         []string `json:"specs"`
	StockQuantity int      `json:"stockQuantity"`
}

func (s *Server) listCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(
		r.Context(),
		`select name, slug, description, color
		 from categories
		 where is_active = true
		 order by display_order, name`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CATEGORY_QUERY_FAILED", "Could not load categories")
		return
	}
	defer rows.Close()

	categories := []categoryResponse{}
	for rows.Next() {
		var category categoryResponse
		if err := rows.Scan(&category.Name, &category.Slug, &category.Description, &category.Color); err != nil {
			writeError(w, http.StatusInternalServerError, "CATEGORY_SCAN_FAILED", "Could not load categories")
			return
		}
		categories = append(categories, category)
	}

	writeJSON(w, http.StatusOK, categories)
}

func (s *Server) getCategory(w http.ResponseWriter, r *http.Request) {
	category, err := s.categoryBySlug(r, chi.URLParam(r, "slug"))
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "CATEGORY_NOT_FOUND", "Category not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CATEGORY_QUERY_FAILED", "Could not load category")
		return
	}

	writeJSON(w, http.StatusOK, category)
}

func (s *Server) listProducts(w http.ResponseWriter, r *http.Request) {
	query := `
		select p.id, p.name, p.slug, p.description, p.category_slug, p.brand,
		       p.price, p.original_price, p.images, (p.stock_quantity > 0) as in_stock,
		       p.is_featured, p.is_popular, p.specs, p.stock_quantity
		from products p
		where p.is_active = true
		  and ($1 = '' or p.category_slug = $1)
		  and ($2 = '' or p.name ilike '%' || $2 || '%' or p.description ilike '%' || $2 || '%' or p.brand ilike '%' || $2 || '%')
		  and ($3 = false or p.is_featured = true)`

	sort := r.URL.Query().Get("sort")
	switch sort {
	case "price_asc":
		query += " order by p.price asc"
	case "price_desc":
		query += " order by p.price desc"
	default:
		query += " order by p.is_popular desc, p.is_featured desc, p.name asc"
	}

	featured, _ := strconv.ParseBool(r.URL.Query().Get("featured"))
	products, err := s.queryProducts(r, query, r.URL.Query().Get("category"), r.URL.Query().Get("search"), featured)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_QUERY_FAILED", "Could not load products")
		return
	}

	writeJSON(w, http.StatusOK, products)
}

func (s *Server) getProduct(w http.ResponseWriter, r *http.Request) {
	products, err := s.queryProducts(
		r,
		`select p.id, p.name, p.slug, p.description, p.category_slug, p.brand,
		        p.price, p.original_price, p.images, (p.stock_quantity > 0) as in_stock,
		        p.is_featured, p.is_popular, p.specs, p.stock_quantity
		 from products p
		 where p.is_active = true and p.slug = $1`,
		chi.URLParam(r, "slug"),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_QUERY_FAILED", "Could not load product")
		return
	}
	if len(products) == 0 {
		writeError(w, http.StatusNotFound, "PRODUCT_NOT_FOUND", "Product not found")
		return
	}

	writeJSON(w, http.StatusOK, products[0])
}

func (s *Server) getCategoryProducts(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	products, err := s.queryProducts(
		r,
		`select p.id, p.name, p.slug, p.description, p.category_slug, p.brand,
		        p.price, p.original_price, p.images, (p.stock_quantity > 0) as in_stock,
		        p.is_featured, p.is_popular, p.specs, p.stock_quantity
		 from products p
		 where p.is_active = true and p.category_slug = $1
		 order by p.is_popular desc, p.is_featured desc, p.name asc`,
		slug,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "PRODUCT_QUERY_FAILED", "Could not load products")
		return
	}

	writeJSON(w, http.StatusOK, products)
}

func (s *Server) categoryBySlug(r *http.Request, slug string) (categoryResponse, error) {
	var category categoryResponse
	err := s.db.QueryRow(
		r.Context(),
		`select name, slug, description, color
		 from categories
		 where is_active = true and slug = $1`,
		slug,
	).Scan(&category.Name, &category.Slug, &category.Description, &category.Color)
	return category, err
}

func (s *Server) queryProducts(r *http.Request, query string, args ...any) ([]productResponse, error) {
	rows, err := s.db.Query(r.Context(), query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []productResponse{}
	for rows.Next() {
		var product productResponse
		var originalPrice pgtype.Int4
		if err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Slug,
			&product.Description,
			&product.Category,
			&product.Brand,
			&product.Price,
			&originalPrice,
			&product.Images,
			&product.InStock,
			&product.Featured,
			&product.Popular,
			&product.Specs,
			&product.StockQuantity,
		); err != nil {
			return nil, err
		}
		if originalPrice.Valid {
			price := int(originalPrice.Int32)
			product.OriginalPrice = &price
		}
		products = append(products, product)
	}

	return products, rows.Err()
}
