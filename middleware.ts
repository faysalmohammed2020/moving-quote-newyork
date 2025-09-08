// middleware.ts (v4)
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/sign-in", // ✅ এখানে-ও একই
  },
});

export const config = {
  matcher: ["/Dashboard/:path*"], // ✅ শুধু প্রোটেক্টেড রুট
};
