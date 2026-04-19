import { Role } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate mapeia sub/email/name/role para userId/email/name/role', () => {
    const strategy = new JwtStrategy();

    expect(
      strategy.validate({
        sub: 9,
        email: 'jwt@user.com',
        name: 'Jwt User',
        role: Role.ADMIN,
      }),
    ).toEqual({
      userId: 9,
      email: 'jwt@user.com',
      name: 'Jwt User',
      role: Role.ADMIN,
      jti: undefined,
      exp: undefined,
    });
  });

  it('validate usa USER quando role ausente no payload', () => {
    const strategy = new JwtStrategy();

    expect(
      strategy.validate({
        sub: 1,
        email: 'legacy@user.com',
        name: 'Legacy',
      }),
    ).toEqual({
      userId: 1,
      email: 'legacy@user.com',
      name: 'Legacy',
      role: Role.USER,
      jti: undefined,
      exp: undefined,
    });
  });
});
