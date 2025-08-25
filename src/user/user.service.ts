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
import { User } from './entity/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { generateSeedPhrase, walletFromSeed } from '@evolution-sdk/lucid';
import { ConfigService } from 'src/config/config.service';
import { encryptMnemonic, decryptMnemonic } from 'src/common/crypto';

export type Network = 'Mainnet' | 'Preprod' | 'Preview';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private jwtService: JwtService,
    private readonly emailService: MailerService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

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
        throw new HttpException(
          this.i18n.translate('message.EMAIL_ALREADY_USED', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      const mnemonic = generateSeedPhrase();
      user.mnemonic = encryptMnemonic(
        mnemonic,
        ConfigService.EncryptConfig.key,
      );

      const wallet = walletFromSeed(mnemonic, {
        network: ConfigService.CardanoConfig.network as Network,
      });
      user.walletAddress = wallet.address;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;

      await this.emailService.sendMail({
        to: user.email,
        subject: `Welcome to the RELOOP application`,
        template: './signup-confirm-otp',
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

      if (!user) {
        throw new HttpException(
          this.i18n.translate('message.EMAIL_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user?.otp != otp) {
        throw new HttpException(
          this.i18n.translate('message.OTP_IS_INVALID', {
            lang: I18nContext.current().lang,
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userRepository.update(
        { email },
        {
          emailVerified: true,
          otp: null,
        },
      );

      return {
        result: true,
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async signIn(username: string, password: string) {
    try {
      const user = await this.userRepository.findOneBy({ username });

      if (!user) {
        throw new UnauthorizedException(
          this.i18n.translate('message.WRONG_SIGNIN_USERNAME', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.emailVerified == false) {
        throw new UnauthorizedException(
          this.i18n.translate('message.EMAIL_NOT_VERIFIED', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new UnauthorizedException(
            this.i18n.translate('message.WRONG_SIGNIN_USERNAME', {
              lang: I18nContext.current().lang,
            }),
          );
        }
      }

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_address: user.walletAddress,
        mnemonic: decryptMnemonic(
          user.mnemonic,
          ConfigService.EncryptConfig.key,
        ),
        role: user.role,
      };

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

      if (!user) {
        throw new UnauthorizedException(
          this.i18n.translate('message.WRONG_SIGNIN_EMAIL', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.emailVerified == false) {
        throw new UnauthorizedException(
          this.i18n.translate('message.EMAIL_NOT_VERIFIED', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new UnauthorizedException(
            this.i18n.translate('message.WRONG_SIGNIN_EMAIL', {
              lang: I18nContext.current().lang,
            }),
          );
        }
      }

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_address: user.walletAddress,
        mnemonic: decryptMnemonic(
          user.mnemonic,
          ConfigService.EncryptConfig.key,
        ),
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
          this.i18n.translate('message.EMAIL_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;

      await this.emailService.sendMail({
        to: user.email,
        subject: `Reset your password on RELOOP application`,
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

      return {
        result: true,
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async checkExistingUsername(username: string) {
    try {
      const exist = await this.userRepository.findOneBy({ username });
      if (exist) {
        return {
          result: true,
        };
      }
      return {
        result: false,
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async checkExistingEmail(email: string) {
    try {
      const exist = await this.userRepository.findOneBy({ email });
      if (exist) {
        return {
          result: true,
        };
      }
      return {
        result: false,
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async changePassword(
    username: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.userRepository.findOneBy({ username });

      if (!user) {
        throw new NotFoundException(
          this.i18n.translate('message.USER_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (isMatch) {
          const salt = await bcrypt.genSalt();
          const newPass = await bcrypt.hash(newPassword, salt);

          await this.userRepository.update(
            { email: user.email },
            {
              password: newPass,
            },
          );

          return {
            result: true,
          };
        } else {
          throw new NotFoundException(
            this.i18n.translate('message.WRONG_CURRENT_PASSWORD', {
              lang: I18nContext.current().lang,
            }),
          );
        }
      } else {
        throw new NotFoundException(
          this.i18n.translate('message.USER_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
        );
      }
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async resetPassword(username: string, password: string, otp: string) {
    try {
      const user = await this.userRepository.findOneBy({
        username,
      });

      if (!user) {
        throw new NotFoundException(
          this.i18n.translate('message.USER_NOT_FOUND', {
            lang: I18nContext.current().lang,
          }),
        );
      }

      if (user?.otp != otp) {
        throw new NotFoundException(
          this.i18n.translate('message.OTP_IS_INVALID', {
            lang: I18nContext.current().lang,
          }),
        );
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

      return {
        result: true,
      };
    } catch (e) {
      throw new HttpException(e.response, e.status);
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
