import "../styles/bbc.css";
import { Providers } from "./providers.jsx";

export const metadata = {
  title: "BBC — Sign in",
  description:
    "B2C identity demo for the LoginRadius React SDK: hosted PKCE sign-in and a BBC-styled account area.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
