import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Setting } from 'src/setting/entity/setting.entity';
// import { Project } from 'src/project/entity/project.entity';
import { User } from './entity/user.entity';
import { Nonce } from './entity/nonce.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from 'src/config/config.service';
import * as bcrypt from 'bcrypt';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private jwtService: JwtService,
    private readonly emailService: MailerService,

    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Nonce)
    private nonceRepository: Repository<Nonce>,

    // @InjectRepository(Project)
    // private projectRepository: Repository<Project>,

    private readonly i18n: I18nService,
  ) {}

  async signUp(signupDto: SignUpDto) {
    try {
      const salt = await bcrypt.genSalt();

      const user = new User();
      user.username = signupDto.username;
      user.password = await bcrypt.hash(signupDto.password, salt);
      user.firstName = signupDto.firstName;
      user.lastName = signupDto.lastName;
      user.email = signupDto.email;
      user.isActive = true;

      const existUser = await this.userRepository.findOneBy({
        username: user.username,
      });
      if (existUser) {
        this.logger.error(
          this.i18n.translate('message.USERNAME_ALREADY_USED', {
            lang: I18nContext.current().lang,
          }),
        );
        throw new HttpException(
          this.i18n.translate('message.USERNAME_ALREADY_USED', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      const existEmail = await this.userRepository.findOneBy({
        email: user.email,
      });
      if (existEmail) {
        this.logger.error(
          this.i18n.translate('message.EMAIL_ALREADY_USED', {
            lang: I18nContext.current().lang,
          }),
        );
        throw new HttpException(
          this.i18n.translate('message.EMAIL_ALREADY_USED', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;

      await this.emailService.sendMail({
        to: user.email,
        subject: `Welcome to the TGE application`,
        template: './confirmation-otp',
        context: {
          username: user.username,
          otp,
        },
      });

      return await this.userRepository.save(user);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async confirmOtp(email: string, otp: string) {
    try {
      const user = await this.userRepository.findOneBy({
        email,
      });

      if (!user || user?.otp != otp) {
        return false;
      }

      await this.userRepository.update(
        { email },
        {
          emailVerified: true,
          otp: null,
        },
      );

      return true;
    } catch (e) {
      this.logger.error(
        `${this.i18n.translate('message.CANNOT_VERIFY_EMAIL', { lang: I18nContext.current().lang })}: ${e.message}`,
      );
      return false;
    }
  }

  async signIn(username: string, password: string) {
    try {
      const user = await this.userRepository.findOneBy({ username });
      if (user?.emailVerified == false) {
        throw new UnauthorizedException(
          this.i18n.translate('message.EMAIL_NOT_VERIFIED', {
            lang: I18nContext.current().lang,
          }),
        );
      }
      if (user?.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException();
      }
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
      };
      console.log('payload: ', payload);
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (user?.emailVerified == false) {
        throw new UnauthorizedException(
          this.i18n.translate('message.EMAIL_NOT_VERIFIED', {
            lang: I18nContext.current().lang,
          }),
        );
      }
      if (user?.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException();
      }
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async sendForgotPasswordOtp(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        throw new NotFoundException(
          this.i18n.translate('message.USER_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;

      await this.emailService.sendMail({
        to: user.email,
        subject: `Restore your password`,
        template: './forgot-password-otp',
        context: {
          username: user.username,
          otp,
        },
      });

      await this.userRepository.update(
        { email },
        {
          otp: otp,
        },
      );

      return true;
    } catch (e) {
      this.logger.error(`[sendForgotPasswordLink], error: ${e.message}`);
      return false;
    }
  }

  async checkExistingUsername(username: string) {
    try {
      const exist = await this.userRepository.findOneBy({ username });
      if (exist) {
        return true;
      }
      return false;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async checkExistingEmail(email: string) {
    try {
      const exist = await this.userRepository.findOneBy({ email });
      if (exist) {
        return true;
      }
      return false;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async checkOldPassword(username: string, password: string) {
    try {
      const user = await this.userRepository.findOneBy({ username });

      if (user?.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return true;
        }
        return false;
      }

      return false;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async changePassword(token: string, password: string) {
    try {
      const { email } = this.jwtService.verify(token, {
        secret: ConfigService.JWTConfig.secret,
      });

      if (email == null || email == undefined) {
        return false;
      }

      const user = await this.userRepository.findOneBy({
        email,
      });

      if (!user) {
        return false;
      }

      const salt = await bcrypt.genSalt();
      const newPassword = await bcrypt.hash(password, salt);

      await this.userRepository.update(
        { email },
        {
          password: newPassword,
        },
      );

      return true;
    } catch (e) {
      this.logger.error(
        `${this.i18n.translate('message.CANNOT_CHANGE_PASSWORD', { lang: I18nContext.current().lang })}: ${e.message}`,
      );
      return false;
    }
  }

  async resetPassword(username: string, password: string, otp: string) {
    try {
      const user = await this.userRepository.findOneBy({
        username,
      });

      if (!user || user?.otp != otp) {
        return false;
      }

      const salt = await bcrypt.genSalt();
      const newPassword = await bcrypt.hash(password, salt);

      await this.userRepository.update(
        { username },
        {
          password: newPassword,
          otp: null,
        },
      );

      return true;
    } catch (e) {
      this.logger.error(
        `${this.i18n.translate('message.CANNOT_RESET_PASSWORD', { lang: I18nContext.current().lang })}: ${e.message}`,
      );
      return false;
    }
  }

  async findAllUser() {
    try {
      return await this.userRepository.find();
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }
}
