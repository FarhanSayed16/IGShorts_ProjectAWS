import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MemberAuthGuard } from './member-auth.guard.js';
import { MemberCredentialsDto, TrackUsernameDto } from './member.dto.js';
import { MembersService } from './members.service.js';

@Controller('members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Post('signup')
  signup(@Body() body: MemberCredentialsDto) {
    return this.members.signup(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: MemberCredentialsDto) {
    return this.members.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(MemberAuthGuard)
  me(@Req() request: FastifyRequest) {
    return this.members.getMe(request.memberUser!.id);
  }

  @Delete('me')
  @UseGuards(MemberAuthGuard)
  remove(@Req() request: FastifyRequest) {
    return this.members.deleteAccount(request.memberUser!.id);
  }

  @Get('tracks')
  @UseGuards(MemberAuthGuard)
  tracks(@Req() request: FastifyRequest) {
    return this.members.listTracks(request.memberUser!.id);
  }

  @Post('tracks')
  @UseGuards(MemberAuthGuard)
  track(@Req() request: FastifyRequest, @Body() body: TrackUsernameDto) {
    return this.members.track(request.memberUser!.id, body.username);
  }

  @Delete('tracks/:username')
  @UseGuards(MemberAuthGuard)
  untrack(@Req() request: FastifyRequest, @Param('username') username: string) {
    return this.members.untrack(request.memberUser!.id, username);
  }

  @Get('profiles/:username')
  @UseGuards(MemberAuthGuard)
  report(@Req() request: FastifyRequest, @Param('username') username: string) {
    return this.members.report(request.memberUser!.id, username);
  }
}
