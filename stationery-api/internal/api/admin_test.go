package api

import "testing"

func TestApplyProductDiscount(t *testing.T) {
	tests := []struct {
		name            string
		price           int
		originalPrice   *int
		discountPercent int
		wantPrice       int
		wantOriginal    *int
	}{
		{
			name:            "calculates ten percent discount from original price",
			price:           0,
			originalPrice:   intPtr(150),
			discountPercent: 10,
			wantPrice:       135,
			wantOriginal:    intPtr(150),
		},
		{
			name:            "keeps price when no discount",
			price:           150,
			originalPrice:   nil,
			discountPercent: 0,
			wantPrice:       150,
			wantOriginal:    nil,
		},
		{
			name:            "removes redundant original price without discount",
			price:           150,
			originalPrice:   intPtr(150),
			discountPercent: 0,
			wantPrice:       150,
			wantOriginal:    nil,
		},
		{
			name:            "rounds calculated selling price",
			price:           0,
			originalPrice:   intPtr(199),
			discountPercent: 20,
			wantPrice:       159,
			wantOriginal:    intPtr(199),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := productWriteRequest{
				Price:           tt.price,
				OriginalPrice:   tt.originalPrice,
				DiscountPercent: tt.discountPercent,
			}

			applyProductDiscount(&request)

			if request.Price != tt.wantPrice {
				t.Fatalf("Price = %d, want %d", request.Price, tt.wantPrice)
			}
			if !sameIntPtr(request.OriginalPrice, tt.wantOriginal) {
				t.Fatalf("OriginalPrice = %v, want %v", request.OriginalPrice, tt.wantOriginal)
			}
		})
	}
}

func intPtr(value int) *int {
	return &value
}

func sameIntPtr(left *int, right *int) bool {
	if left == nil || right == nil {
		return left == right
	}
	return *left == *right
}
