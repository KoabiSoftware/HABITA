import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { Controller, Get, Module, ValidationPipe } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import helmet from "helmet";
import { Database, DatabaseModule } from "./database";
import { AuthModule } from "./auth";
import { PropertiesModule } from "./properties";
import { CategoriesModule, LocationsModule } from "./catalog";
import { InquiriesModule } from "./inquiries";
import { FavoritesModule, UsersModule } from "./users";
import { MediaModule } from "./media";
@Controller("health")
class HealthController {
  constructor(private db: Database) {}
  @Get() async health() {
    await this.db.$queryRaw`SELECT 1`;
    return { status: "ok", database: "postgresql" };
  }
}
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PropertiesModule,
    CategoriesModule,
    LocationsModule,
    InquiriesModule,
    FavoritesModule,
    UsersModule,
    MediaModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 90 }]),
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
class AppModule {}
async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw Error("JWT_SECRET debe contener al menos 32 caracteres.");
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Solo JSON en mutaciones: protege las cookies SameSite contra formularios CSRF.
  app.use((req: any, res: any, next: any) => {
    if (
      ["POST", "PATCH", "PUT", "DELETE"].includes(req.method) &&
      !req.headers["content-type"]?.includes("application/json")
    )
      return res.status(415).json({ message: "Se requiere application/json." });
    next();
  });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT || 4000), "127.0.0.1");
}
bootstrap().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
