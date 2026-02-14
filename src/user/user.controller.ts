import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { SignInEmailDto } from './dto/signin-email.dto';
import { EmailDto } from './dto/email.dto';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { UsernameDto } from './dto/username.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { UserResponseDto } from './response-dto/user.response-dto';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('Sign up')
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

  @ApiTags('Sign up')
  @Public()
  @ApiOperation({ summary: 'Verify email with OTP' })
  @Post('confirm-otp')
  async confirmOtp(@Body() otpDto: ConfirmOtpDto) {
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

  @ApiTags('Check')
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

  @ApiTags('Check')
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

  @ApiTags('Sign in')
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

  @ApiTags('Sign in')
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

  @ApiTags('User profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    delete req.user.iat;
    delete req.user.exp;
    delete req.user.role;
    return req.user;
  }

  @ApiTags('All users')
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

  @ApiTags('Change password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Change current password' })
  @Post('change-password')
  changePassword(
    @Request() req,
    @Body() { currentPassword, newPassword }: ChangePasswordDto,
  ) {
    try {
      return this.userService.changePassword(
        req.user.username,
        currentPassword,
        newPassword,
      );
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @ApiTags('Forgot password')
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

  @ApiTags('Forgot password')
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
}
