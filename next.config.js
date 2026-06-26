module.exports = {
  output: "export",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://dsa-revision-backend.onrender.com/api",
  },
};
