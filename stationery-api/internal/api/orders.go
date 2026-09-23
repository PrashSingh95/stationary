package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type createOrderRequest struct {
	AddressID     string `json:"addressId"`
	PaymentMethod string `json:"paymentMethod"`
}

type orderItemResponse struct {
	ID          string `json:"id"`
	ProductID   string `json:"productId"`
	ProductName string `json:"productName"`
	UnitPrice   int    `json:"unitPrice"`
	Quantity    int    `json:"quantity"`
	Subtotal    int    `json:"subtotal"`
}

type orderResponse struct {
	ID            string              `json:"id"`
	UserID        string              `json:"userId"`
	Status        string              `json:"status"`
	PaymentMethod string              `json:"paymentMethod"`
	PaymentStatus string              `json:"paymentStatus"`
	TotalAmount   int                 `json:"totalAmount"`
	CreatedAt     string              `json:"createdAt"`
	Items         []orderItemResponse `json:"items"`
}

func (s *Server) createOrder(w http.ResponseWriter, r *http.Request) {
	var request createOrderRequest
	if err := decodeJSON(r, &request); err != nil || request.AddressID == "" {
		writeError(w, http.StatusBadRequest, "INVALID_ORDER", "Address is required")
		return
	}
	if request.PaymentMethod == "" {
		request.PaymentMethod = "COD"
	}
	if request.PaymentMethod != "COD" && request.PaymentMethod != "ONLINE" {
		writeError(w, http.StatusBadRequest, "INVALID_PAYMENT_METHOD", "Payment method must be COD or ONLINE")
		return
	}

	ctx := r.Context()
	userID := userIDFromContext(ctx)
	tx, err := s.db.Begin(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_CREATE_FAILED", "Could not create order")
		return
	}
	defer tx.Rollback(ctx)

	var addressExists bool
	if err := tx.QueryRow(ctx, `select exists(select 1 from addresses where id = $1 and user_id = $2)`, request.AddressID, userID).Scan(&addressExists); err != nil || !addressExists {
		writeError(w, http.StatusBadRequest, "ADDRESS_NOT_FOUND", "Address not found")
		return
	}

	rows, err := tx.Query(
		ctx,
		`select c.product_id, p.name, p.price, c.quantity, p.stock_quantity
		 from cart_items c
		 join products p on p.id = c.product_id
		 where c.user_id = $1 and p.is_active = true
		 order by c.created_at`,
		userID,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "CART_QUERY_FAILED", "Could not load cart")
		return
	}
	defer rows.Close()

	type cartLine struct {
		ProductID string
		Name      string
		Price     int
		Quantity  int
		Stock     int
	}
	lines := []cartLine{}
	total := 0
	for rows.Next() {
		var line cartLine
		if err := rows.Scan(&line.ProductID, &line.Name, &line.Price, &line.Quantity, &line.Stock); err != nil {
			writeError(w, http.StatusInternalServerError, "CART_SCAN_FAILED", "Could not load cart")
			return
		}
		if line.Quantity > line.Stock {
			writeError(w, http.StatusConflict, "PRODUCT_OUT_OF_STOCK", line.Name+" does not have enough stock")
			return
		}
		total += line.Price * line.Quantity
		lines = append(lines, line)
	}
	if len(lines) == 0 {
		writeError(w, http.StatusBadRequest, "EMPTY_CART", "Cart is empty")
		return
	}

	var order orderResponse
	err = tx.QueryRow(
		ctx,
		`insert into orders (user_id, address_id, payment_method, payment_status, total_amount)
		 values ($1, $2, $3, $4, $5)
		 returning id::text, user_id::text, status, payment_method, payment_status, total_amount, created_at::text`,
		userID,
		request.AddressID,
		request.PaymentMethod,
		map[bool]string{true: "PENDING", false: "PAID"}[request.PaymentMethod == "COD"],
		total,
	).Scan(&order.ID, &order.UserID, &order.Status, &order.PaymentMethod, &order.PaymentStatus, &order.TotalAmount, &order.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_CREATE_FAILED", "Could not create order")
		return
	}

	for _, line := range lines {
		subtotal := line.Price * line.Quantity
		var item orderItemResponse
		if err := tx.QueryRow(
			ctx,
			`insert into order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
			 values ($1, $2, $3, $4, $5, $6)
			 returning id::text, product_id, product_name, unit_price, quantity, subtotal`,
			order.ID,
			line.ProductID,
			line.Name,
			line.Price,
			line.Quantity,
			subtotal,
		).Scan(&item.ID, &item.ProductID, &item.ProductName, &item.UnitPrice, &item.Quantity, &item.Subtotal); err != nil {
			writeError(w, http.StatusInternalServerError, "ORDER_ITEM_CREATE_FAILED", "Could not create order")
			return
		}
		order.Items = append(order.Items, item)

		if _, err := tx.Exec(ctx, `update products set stock_quantity = stock_quantity - $1 where id = $2`, line.Quantity, line.ProductID); err != nil {
			writeError(w, http.StatusInternalServerError, "INVENTORY_UPDATE_FAILED", "Could not update inventory")
			return
		}
	}

	if _, err := tx.Exec(ctx, `delete from cart_items where user_id = $1`, userID); err != nil {
		writeError(w, http.StatusInternalServerError, "CART_CLEAR_FAILED", "Could not clear cart")
		return
	}

	if err := tx.Commit(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_CREATE_FAILED", "Could not create order")
		return
	}

	writeJSON(w, http.StatusCreated, order)
}

func (s *Server) listOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := s.loadOrders(r, `where o.user_id = $1 order by o.created_at desc`, userIDFromContext(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_QUERY_FAILED", "Could not load orders")
		return
	}
	writeJSON(w, http.StatusOK, orders)
}

func (s *Server) getOrder(w http.ResponseWriter, r *http.Request) {
	orders, err := s.loadOrders(r, `where o.id = $1 and o.user_id = $2`, chi.URLParam(r, "id"), userIDFromContext(r.Context()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_QUERY_FAILED", "Could not load order")
		return
	}
	if len(orders) == 0 {
		writeError(w, http.StatusNotFound, "ORDER_NOT_FOUND", "Order not found")
		return
	}
	writeJSON(w, http.StatusOK, orders[0])
}

func (s *Server) cancelOrder(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(
		r.Context(),
		`update orders set status = 'CANCELLED', updated_at = now()
		 where id = $1 and user_id = $2 and status in ('PENDING', 'CONFIRMED')`,
		chi.URLParam(r, "id"),
		userIDFromContext(r.Context()),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ORDER_CANCEL_FAILED", "Could not cancel order")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"cancelled": true})
}

func (s *Server) loadOrders(r *http.Request, whereClause string, args ...any) ([]orderResponse, error) {
	rows, err := s.db.Query(
		r.Context(),
		`select o.id::text, o.user_id::text, o.status, o.payment_method, o.payment_status, o.total_amount, o.created_at::text
		 from orders o `+whereClause,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []orderResponse{}
	for rows.Next() {
		var order orderResponse
		if err := rows.Scan(&order.ID, &order.UserID, &order.Status, &order.PaymentMethod, &order.PaymentStatus, &order.TotalAmount, &order.CreatedAt); err != nil {
			return nil, err
		}
		items, err := s.loadOrderItems(r, order.ID)
		if err != nil {
			return nil, err
		}
		order.Items = items
		orders = append(orders, order)
	}
	if err := rows.Err(); err != nil && err != pgx.ErrNoRows {
		return nil, err
	}
	return orders, nil
}

func (s *Server) loadOrderItems(r *http.Request, orderID string) ([]orderItemResponse, error) {
	rows, err := s.db.Query(
		r.Context(),
		`select id::text, product_id, product_name, unit_price, quantity, subtotal
		 from order_items
		 where order_id = $1`,
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []orderItemResponse{}
	for rows.Next() {
		var item orderItemResponse
		if err := rows.Scan(&item.ID, &item.ProductID, &item.ProductName, &item.UnitPrice, &item.Quantity, &item.Subtotal); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
