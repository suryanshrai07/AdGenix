import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/themes";
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY is not defined in the environment variables.",
  );
}

createRoot(document.getElementById("root")! as HTMLElement).render(
  <ClerkProvider
    appearance={{
      theme: dark,
      variables: {
        colorPrimary: "#4f39f6",
        colorTextOnPrimaryBackground: "#ffffff",
      },
    }}
    publishableKey={publishableKey}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
