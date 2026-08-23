import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Users } from './entities/users.entity';
import { AppLogger } from '../logging/logger.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('AuthService');
  }

  /** Creates the initial admin account from .env if no user exists yet. */
  async onModuleInit(): Promise<void> {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !email || !password) {
      this.logger.warn('Admin-Seed übersprungen: ADMIN_* Variablen fehlen');
      return;
    }

    const admin = this.usersRepository.create({
      username,
      email,
      password: await this.hashPassword(password),
      roles: ['admin'],
      status: 'up',
      createdAt: new Date(),
    });
    await this.usersRepository.save(admin);
    this.logger.log('Admin-Benutzer initial angelegt', { event: 'admin_seed' });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async login(
    usernameOrEmail: string,
    plainTextPassword: string,
  ): Promise<{ token: string; username: string; roles: string[] }> {
    if (!usernameOrEmail || !plainTextPassword) {
      throw new HttpException(
        'E-Mail/Benutzername und Passwort sind erforderlich',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = usernameOrEmail.includes('@')
      ? await this.usersRepository.findOne({ where: { email: usernameOrEmail } })
      : await this.usersRepository.findOne({ where: { username: usernameOrEmail } });

    if (!user || !(await bcrypt.compare(plainTextPassword, user.password))) {
      this.logger.warn('Fehlgeschlagener Login-Versuch', { event: 'login_failed' });
      throw new HttpException('Ungültige Zugangsdaten', HttpStatus.UNAUTHORIZED);
    }

    if (user.status !== 'up') {
      throw new HttpException('Benutzer nicht aktiviert', HttpStatus.UNAUTHORIZED);
    }

    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    const payload = {
      sub: user.user_id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };

    this.logger.log('Login erfolgreich', { event: 'login_success', userId: user.user_id });

    return { token: this.jwtService.sign(payload), username: user.username, roles: user.roles };
  }
}
