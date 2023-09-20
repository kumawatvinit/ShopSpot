import bcrypt from 'bcrypt';

// encrypt password
export const hashPassword = async(password) => {
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch(error) {
        // console.log(error);
    }
};

// compare password with hashed password in DB
export const comparePassword = async(password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};