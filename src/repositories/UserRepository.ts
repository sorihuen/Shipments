import { AppDataSource } from "../Config/data-source";
import { User } from "../entities/User";

export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    // Método findOne genérico
    async findOne(options: any): Promise<User | null> {
        return await this.userRepository.findOne(options);
    }
}