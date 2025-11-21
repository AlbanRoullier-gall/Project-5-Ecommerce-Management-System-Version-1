import "../styles/globals.css";
import type { AppProps } from "next/app";
import { CartProvider } from "../contexts/CartContext";
import { CheckoutProvider } from "../contexts/CheckoutContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <CheckoutProvider>
        <Component {...pageProps} />
      </CheckoutProvider>
    </CartProvider>
  );
}
