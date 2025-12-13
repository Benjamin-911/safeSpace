/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set workspace root to fix lockfile warning
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig

