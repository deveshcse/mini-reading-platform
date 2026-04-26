/** @type {import('next').NextConfig} */
const remotePatterns = [];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const u = new URL(apiUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**",
    });
  } catch {
    /* invalid URL in env — skip */
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
