import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  HttpException,
  Render,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiExcludeEndpoint,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInEmailDto } from './dto/sign-in-email.dto';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import { UsernameDto } from './dto/username.dto';
import { TransferDto } from './dto/transfer.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { UserResponseDto } from './response-dto/user.response-dto';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Public()
  // @ApiExcludeEndpoint()
  // @ApiOperation({ summary: 'Sign up for new user' })
  // @Post('signup')
  // async signUp(@Body() signupDto: SignUpDto) {
  //   try {
  //     const newUser = await this.userService.signUp(signupDto);
  //     return plainToInstance(UserResponseDto, newUser);
  //   } catch (e) {
  //     throw new HttpException(e.response, e.status);
  //   }
  // }

  @Public()
  @ApiOperation({ summary: 'Sign up for new user with OTP to verify email' })
  @Post('signup')
  async signUp(@Body() signupDto: SignUpDto) {
    try {
      const newUser = await this.userService.signUp(signupDto);
      return plainToInstance(UserResponseDto, newUser);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Verify email with OTP' })
  @Post('confirm-otp')
  async confirmOtp(@Body() otpDto: OtpDto) {
    try {
      const result = await this.userService.confirmOtp(
        otpDto.email,
        otpDto.otp,
      );
      return result;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Sign in' })
  @Post('signin')
  signIn(@Body() signinDto: SignInDto) {
    try {
      return this.userService.signIn(signinDto.username, signinDto.password);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Sign in with email' })
  @Post('signin/email')
  signInWithEmail(@Body() signinEmailDto: SignInEmailDto) {
    try {
      return this.userService.signInWithEmail(
        signinEmailDto.email,
        signinEmailDto.password,
      );
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  // @Public()
  // @ApiExcludeEndpoint()
  // @Get('verify-email')
  // @Render('confirm-email')
  // verifyEmail(@Query('token') token: string) {
  //   try {
  //     return this.userService.verifyEmail(token);
  //   } catch (e) {
  //     throw new HttpException(e.response, e.status);
  //   }
  // }

  @Public()
  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  sendForgotPasswordLink(@Body() { email }: EmailDto) {
    try {
      return this.userService.sendForgotPasswordOtp(email);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  resetPassword(@Body() { username, password, otp }: ResetPasswordDto) {
    try {
      return this.userService.resetPassword(username, password, otp);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Change current password' })
  @Post('change-password')
  changePassword(@Body() { token, password }: RestorePasswordDto) {
    try {
      return this.userService.changePassword(token, password);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Check existing username' })
  @Post('check/username')
  checkExistingUsername(@Body() { username }: UsernameDto) {
    try {
      return this.userService.checkExistingUsername(username);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Check existing email' })
  @Post('check/email')
  checkExistingEmail(@Body() { email }: EmailDto) {
    try {
      return this.userService.checkExistingEmail(email);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Check old password' })
  @UseGuards(AuthGuard)
  @Post('check/old-password')
  checkOldPassword(@Body() signinDto: SignInDto) {
    try {
      return this.userService.checkOldPassword(
        signinDto.username,
        signinDto.password,
      );
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('req.user: ', req);
    return req.user;
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @Get('all')
  async findAllUser() {
    try {
      const allUsers = await this.userService.findAllUser();
      return plainToInstance(UserResponseDto, allUsers);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }
}
