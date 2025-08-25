export default {
  async rewrites() {
    return [{ source: "/.well-known/jwks.json", destination: "/api/jwks" }];
  },
};
