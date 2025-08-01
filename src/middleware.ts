export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/proyectos/admin/:path*", // protege el admin
  ],
};
