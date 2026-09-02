/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The SDK ships an ESM build that externalises only React (core is bundled
  // in). Transpiling it here keeps it in this app's compilation pipeline
  // rather than being treated as a pre-built external.
  transpilePackages: ["@loginradius/loginradius-react"],
};

export default nextConfig;
