import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: passwordHash,
        },
      });
      const { password: _p, ...safe } = user;
      return safe;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Este e-mail já está cadastrado');
      }
      throw e;
    }
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: UpdateUserDto = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.email) {
      data.email = data.email.trim().toLowerCase();
    }
    if (data.name) {
      data.name = data.name.trim();
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password: _p, ...safe } = user;
    return safe;
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
