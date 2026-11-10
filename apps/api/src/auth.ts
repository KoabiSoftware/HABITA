import {
  Body,
  CanActivate,
  ConflictException,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Module,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { IsEmail, IsString, Length } from "class-validator";
import { compare, hash } from "bcryptjs";
import type { Request, Response } from "express";
import { Database } from "./database";
import { Throttle } from "@nestjs/throttler";
export type AuthedRequest = Request & {
  user: { id: string; role: string; name: string; email: string };
};
export class LoginDto {
  @IsEmail() email: string;
  @IsString() @Length(10, 72) password: string;
}
export class RegisterDto extends LoginDto {
  @IsString() @Length(2, 80) name: string;
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private db: Database,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const raw = req.headers.cookie
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("habita_session="))
      ?.slice(15);
    if (!raw) throw new UnauthorizedException("Inicia sesión para continuar.");
    try {
      const payload = this.jwt.verify(raw);
      const u = await this.db.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true },
      });
      if (!u) throw Error();
      req.user = u;
      return true;
    } catch {
      throw new UnauthorizedException("Tu sesión ha caducado.");
    }
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(c: ExecutionContext) {
    return c.switchToHttp().getRequest<AuthedRequest>().user?.role === "ADMIN";
  }
}
@Injectable()
export class AuthService {
  constructor(
    private db: Database,
    private jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    if (await this.db.user.findUnique({ where: { email } }))
      throw new ConflictException("Este correo ya tiene una cuenta.");
    try {
      return await this.db.user.create({
        data: {
          email,
          name: dto.name,
          passwordHash: await hash(dto.password, 12),
        },
        select: { id: true, name: true, email: true, role: true },
      });
    } catch (e: any) {
      if (e.code === "P2002")
        throw new ConflictException("Este correo ya tiene una cuenta.");
      throw e;
    }
  }
  async login(dto: LoginDto) {
    const u = await this.db.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!u || !(await compare(dto.password, u.passwordHash)))
      throw new UnauthorizedException("Correo o contraseña incorrectos.");
    return { id: u.id, name: u.name, email: u.email, role: u.role };
  }
  session(u: { id: string }, res: Response) {
    res.cookie("habita_session", this.jwt.sign({ sub: u.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400000,
    });
  }
}
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post("register")
  @Throttle({ default: { ttl: 60000, limit: 12 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const u = await this.auth.register(dto);
    this.auth.session(u, res);
    return u;
  }
  @Post("login") @Throttle({ default: { ttl: 60000, limit: 12 } }) async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const u = await this.auth.login(dto);
    this.auth.session(u, res);
    return u;
  }
  @Post("logout") logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("habita_session", { path: "/" });
    return { ok: true };
  }
  @Get("me") @UseGuards(SessionGuard) me(@Req() req: AuthedRequest) {
    return req.user;
  }
}
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, AdminGuard],
  exports: [SessionGuard, AdminGuard, JwtModule],
})
export class AuthModule {}
