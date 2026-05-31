import bcrypt from 'bcrypt'

// Definimos el tiempo que tardara en devolver el hash la funcion
const SALT_ROUNDS = 12;

export const hashPassword = async (password:string) =>{
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
        return hashedPassword;

    } catch (error) {
        console.log('Error al crear el hash de la contraseña')
        throw error
    }
}

export const compareHash = async (password: string, hashedPassword:string) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword)
        return isMatch;
    } catch (error) {
        console.log('Error al comparar el hash de la contraseña ingresada')
        throw error
    }
}
