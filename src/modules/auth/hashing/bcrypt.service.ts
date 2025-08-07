import { HashingService } from "./hashing.service";
import * as bcrypt from "bcrypt"

export class BcryptService extends HashingService{


    async hash(password: string) {

        const salt = await bcrypt.genSalt()
        
        return bcrypt.hash(password, salt) 
    }
    async compare(password: string, paswordHashing: string) {
        return bcrypt.compare(password, paswordHashing)
    }
    
}