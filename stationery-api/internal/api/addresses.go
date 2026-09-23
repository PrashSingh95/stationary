package api

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

type addressRequest struct {
	RecipientName string `json:"recipientName"`
	Phone         string `json:"phone"`
	Line1         string `json:"line1"`
	Line2         string `json:"line2"`
	City          string `json:"city"`
	State         string `json:"state"`
	PostalCode    string `json:"postalCode"`
	IsDefault     bool   `json:"isDefault"`
}

type addressResponse struct {
	ID            string `json:"id"`
	RecipientName string `json:"recipientName"`
	Phone         string `json:"phone"`
	Line1         string `json:"line1"`
	Line2         string `json:"line2"`
	City          string `json:"city"`
	State         string `json:"state"`
	PostalCode    string `json:"postalCode"`
	IsDefault     bool   `json:"isDefault"`
}

func (s *Server) listAddresses(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(
		r.Context(),
		`select id::text, recipient_name, phone, line1, coalesce(line2, ''), city, state, postal_code, is_default
		 from addresses
		 where user_id = $1
		 order by is_default desc, created_at desc`,
		userIDFromContext(r.Context()),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ADDRESS_QUERY_FAILED", "Could not load addresses")
		return
	}
	defer rows.Close()

	addresses := []addressResponse{}
	for rows.Next() {
		var address addressResponse
		if err := rows.Scan(
			&address.ID,
			&address.RecipientName,
			&address.Phone,
			&address.Line1,
			&address.Line2,
			&address.City,
			&address.State,
			&address.PostalCode,
			&address.IsDefault,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "ADDRESS_SCAN_FAILED", "Could not load addresses")
			return
		}
		addresses = append(addresses, address)
	}

	writeJSON(w, http.StatusOK, addresses)
}

func (s *Server) createAddress(w http.ResponseWriter, r *http.Request) {
	request, ok := s.validAddressRequest(w, r)
	if !ok {
		return
	}

	if request.IsDefault {
		_, _ = s.db.Exec(r.Context(), `update addresses set is_default = false where user_id = $1`, userIDFromContext(r.Context()))
	}

	var address addressResponse
	err := s.db.QueryRow(
		r.Context(),
		`insert into addresses (user_id, recipient_name, phone, line1, line2, city, state, postal_code, is_default)
		 values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 returning id::text, recipient_name, phone, line1, coalesce(line2, ''), city, state, postal_code, is_default`,
		userIDFromContext(r.Context()),
		request.RecipientName,
		request.Phone,
		request.Line1,
		request.Line2,
		request.City,
		request.State,
		request.PostalCode,
		request.IsDefault,
	).Scan(&address.ID, &address.RecipientName, &address.Phone, &address.Line1, &address.Line2, &address.City, &address.State, &address.PostalCode, &address.IsDefault)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ADDRESS_CREATE_FAILED", "Could not save address")
		return
	}

	writeJSON(w, http.StatusCreated, address)
}

func (s *Server) updateAddress(w http.ResponseWriter, r *http.Request) {
	request, ok := s.validAddressRequest(w, r)
	if !ok {
		return
	}

	if request.IsDefault {
		_, _ = s.db.Exec(r.Context(), `update addresses set is_default = false where user_id = $1`, userIDFromContext(r.Context()))
	}

	var address addressResponse
	err := s.db.QueryRow(
		r.Context(),
		`update addresses
		 set recipient_name = $1, phone = $2, line1 = $3, line2 = $4, city = $5, state = $6,
		     postal_code = $7, is_default = $8, updated_at = now()
		 where id = $9 and user_id = $10
		 returning id::text, recipient_name, phone, line1, coalesce(line2, ''), city, state, postal_code, is_default`,
		request.RecipientName,
		request.Phone,
		request.Line1,
		request.Line2,
		request.City,
		request.State,
		request.PostalCode,
		request.IsDefault,
		chi.URLParam(r, "id"),
		userIDFromContext(r.Context()),
	).Scan(&address.ID, &address.RecipientName, &address.Phone, &address.Line1, &address.Line2, &address.City, &address.State, &address.PostalCode, &address.IsDefault)
	if err != nil {
		writeError(w, http.StatusNotFound, "ADDRESS_NOT_FOUND", "Address not found")
		return
	}

	writeJSON(w, http.StatusOK, address)
}

func (s *Server) deleteAddress(w http.ResponseWriter, r *http.Request) {
	_, err := s.db.Exec(
		r.Context(),
		`delete from addresses where id = $1 and user_id = $2`,
		chi.URLParam(r, "id"),
		userIDFromContext(r.Context()),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "ADDRESS_DELETE_FAILED", "Could not delete address")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (s *Server) validAddressRequest(w http.ResponseWriter, r *http.Request) (addressRequest, bool) {
	var request addressRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_ADDRESS", "Invalid address request")
		return request, false
	}

	request.RecipientName = strings.TrimSpace(request.RecipientName)
	request.Phone = strings.TrimSpace(request.Phone)
	request.Line1 = strings.TrimSpace(request.Line1)
	request.City = strings.TrimSpace(request.City)
	request.State = strings.TrimSpace(request.State)
	request.PostalCode = strings.TrimSpace(request.PostalCode)

	if request.RecipientName == "" || request.Phone == "" || request.Line1 == "" || request.City == "" || request.State == "" || request.PostalCode == "" {
		writeError(w, http.StatusBadRequest, "INVALID_ADDRESS", "Recipient, phone, address, city, state, and postal code are required")
		return request, false
	}

	return request, true
}
