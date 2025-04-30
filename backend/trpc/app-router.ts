import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/routes";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
});

export type AppRouter = typeof appRouter;