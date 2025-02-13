import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
    username!: string; 

    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email!: string; 

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password!: string; 

    @IsOptional() 
    @IsIn(['user', 'admin'], { message: 'El rol debe ser "user" o "admin"' })
    role?: string; 
}