package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type cartItemResponse struct {
	ID       string          `json:"id"`
	Quantity int             `json:"quantity"`
	Product  productResponse `json:"product"`
	Subtotal int             `json:"subtotal"`
}

type cartResponse struct {
	Items []cartItemResponse `json:"items"`
	Total int                `json:"total"`
}

type cartItemRequest struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

func (s *Server) getCart(w http.ResponseWriter, r *http.Request) {
	cart, err := s.loadCart(r, userIDFromContext(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_QUERY_FAILED", "Could not load cart")
		return
	}
	writeJSON(w, http.StatusOK, cart)
}

func (s *Server) addCartItem(w http.ResponseWriter, r *http.Request) {
	var request cartItemRequest
	if err := decodeJSON(r, &request); err != nil || request.ProductID == "" || request.Quantity < 1 {
		writeError(w, http.StatusBadRequest, "INVALID_CART_ITEM", "Product and quantity are required")
		return
	}

	available, err := s.stockAvailable(r, request.ProductID, request.Quantity)
	if err != nil {
		writeError(w, http.StatusNotFound, "PRODUCT_NOT_FOUND", "Product not found")
		return
	}
	if !available {
		writeError(w, http.StatusConflict, "PRODUCT_OUT_OF_STOCK", "Requested quantity is not available")
		return
	}

	_, err = s.db.Exec(
		r.Context(),
		`insert into cart_items (user_id, product_id, quantity)
		 values ($1, $2, $3)
		 on conflict (user_id, product_id)
		 do update set quantity = cart_items.quantity + excluded.quantity, updated_at = now()`,
		userIDFromContext(r.Context()),
		request.ProductID,
		request.Quantity,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_UPDATE_FAILED", "Could not add item to cart")
		return
	}

	cart, _ := s.loadCart(r, userIDFromContext(r.Context()))
	writeJSON(w, http.StatusCreated, cart)
}

func (s *Server) updateCartItem(w http.ResponseWriter, r *http.Request) {
	var request cartItemRequest
	if err := decodeJSON(r, &request); err != nil || request.Quantity < 1 {
		writeError(w, http.StatusBadRequest, "INVALID_QUANTITY", "Quantity must be at least 1")
		return
	}

	_, err := s.db.Exec(
		r.Context(),
		`update cart_items
		 set quantity = $1, updated_at = now()
		 where id = $2 and user_id = $3`,
		request.Quantity,
		chi.URLParam(r, "id"),
		userIDFromContext(r.Context()),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_UPDATE_FAILED", "Could not update cart item")
		return
	}

	cart, _ := s.loadCart(r, userIDFromContext(r.Context()))
	writeJSON(w, http.StatusOK, cart)
}

func (s *Server) deleteCartItem(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(
		r.Context(),
		`delete from cart_items where id = $1 and user_id = $2`,
		chi.URLParam(r, "id"),
		userIDFromContext(r.Context()),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_DELETE_FAILED", "Could not remove item")
		return
	}

	cart, _ := s.loadCart(r, userIDFromContext(r.Context()))
	writeJSON(w, http.StatusOK, cart)
}

func (s *Server) clearCart(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(r.Context(), `delete from cart_items where user_id = $1`, userIDFromContext(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_CLEAR_FAILED", "Could not clear cart")
		return
	}
	writeJSON(w, http.StatusOK, cartResponse{Items: []cartItemResponse{}, Total: 0})
}

func (s *Server) loadCart(r *http.Request, userID string) (cartResponse, error) {
	rows, err := s.db.Query(
		r.Context(),
		`select c.id::text, c.quantity,
		        p.id, p.name, p.slug, p.description, p.category_slug, p.brand,
		        p.price, p.original_price, p.images, (p.stock_quantity > 0) as in_stock,
		        p.is_featured, p.is_popular, p.specs, p.stock_quantity
		 from cart_items c
		 join products p on p.id = c.product_id
		 where c.user_id = $1 and p.is_active = true
		 order by c.created_at desc`,
		userID,
	)
	if err != nil {
		return cartResponse{}, err
	}
	defer rows.Close()

	cart := cartResponse{Items: []cartItemResponse{}}
	for rows.Next() {
		item := cartItemResponse{}
		var originalPrice pgtype.Int4
		if err := rows.Scan(
			&item.ID,
			&item.Quantity,
			&item.Product.ID,
			&item.Product.Name,
			&item.Product.Slug,
			&item.Product.Description,
			&item.Product.Category,
			&item.Product.Brand,
			&item.Product.Price,
			&originalPrice,
			&item.Product.Images,
			&item.Product.InStock,
			&item.Product.Featured,
			&item.Product.Popular,
			&item.Product.Specs,
			&item.Product.StockQuantity,
		); err != nil {
			return cartResponse{}, err
		}
		if originalPrice.Valid {
			price := int(originalPrice.Int32)
			item.Product.OriginalPrice = &price
		}
		item.Subtotal = item.Product.Price * item.Quantity
		cart.Total += item.Subtotal
		cart.Items = append(cart.Items, item)
	}

	return cart, rows.Err()
}

func (s *Server) stockAvailable(r *http.Request, productID string, quantity int) (bool, error) {
	var stock int
	err := s.db.QueryRow(
		r.Context(),
		`select stock_quantity from products where id = $1 and is_active = true`,
		productID,
	).Scan(&stock)
	if err != nil {
		return false, err
	}
	return stock >= quantity, nil
}
