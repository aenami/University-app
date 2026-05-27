// Importamos tipos de datos
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

type userInfo = {
    id: number;
    nombre: string;
}

export const tokenManager = {
    //1. Funcion que se encargara de guardar la session del usuario (TOken y su user). Recibe el token generado al logearse y la identificacion del usuario
    saveSession(token: string, user: userInfo){
        const parse_user = JSON.stringify(user) // Parseamos el objeto de usuario 
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, parse_user)
    },

    //2. Funcion que se encargara de retornarnos el token almacenado
    getToken(){
        return localStorage.getItem(TOKEN_KEY);
    },

    //3. Funcion que se encargara de traernos la informacion basica del usuario
    getUser(){
        const user = localStorage.getItem(USER_KEY)
        return user ? JSON.parse(user) : null
    },

    //4. Funcion que se encargara de limpiar la sesion almacenada (Para cuando el usuario haga logout)
    clearSession(){
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    //5. Funcion que se encargara de verificar la autenticidad del usuario (minimamente)
    isAuthenticated(){
        const token = localStorage.getItem(TOKEN_KEY); 
        if (!token) return false;

        try {
            // Decodifica el payload (segunda parte del JWT)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Verifica expiración
            const isExpired = payload.exp * 1000 < Date.now();
            return !isExpired;
        } catch {
            return false; // Token malformado
        }
    }
    

}