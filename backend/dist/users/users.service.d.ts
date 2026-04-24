import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    create(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<UserDocument>;
    updateLevel(userId: string, level: string): Promise<void>;
}
