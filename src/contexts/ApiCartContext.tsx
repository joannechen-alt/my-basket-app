"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api/client";
import { getUserId } from "@/lib/session";

interface ApiCartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  dataAiHint: string;
  category: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  addedAt: string;
}

interface Cart {
  id: string;
  userId: string;
  items: ApiCartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'RESET_CART' };

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, error: null };
    case 'RESET_CART':
      return initialState;
    default:
      return state;
  }
};

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  totalCartItems: number;
  totalAmount: number;
  items: ApiCartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<Cart>;
  updateCartItem: (productId: string, quantity: number) => Promise<Cart>;
  removeFromCart: (productId: string) => Promise<Cart>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = getUserId();
      const cartData = await apiClient.getCart(userId) as Cart;
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (err) {
      console.error('Error fetching cart:', err);
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to fetch cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1): Promise<Cart> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = getUserId();
      const updatedCart = await apiClient.addToCart(userId, productId, quantity) as Cart;
      dispatch({ type: 'SET_CART', payload: updatedCart });
      return updatedCart;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = getUserId();
      const updatedCart = await apiClient.updateCartItem(userId, productId, quantity) as Cart;
      dispatch({ type: 'SET_CART', payload: updatedCart });
      return updatedCart;
    } catch (err) {
      console.error('Error updating cart item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (productId: string): Promise<Cart> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = getUserId();
      const updatedCart = await apiClient.removeFromCart(userId, productId) as Cart;
      dispatch({ type: 'SET_CART', payload: updatedCart });
      return updatedCart;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const userId = getUserId();
      await apiClient.clearCart(userId);
      dispatch({ type: 'SET_CART', payload: null });
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Auto-fetch cart on provider mount
  useEffect(() => {
    fetchCart();
  }, []);

  const contextValue: CartContextType = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    totalCartItems: state.cart?.totalItems || 0,
    totalAmount: state.cart?.totalAmount || 0,
    items: state.cart?.items || [],
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
