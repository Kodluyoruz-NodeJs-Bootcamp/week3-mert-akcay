//This interface's for credentials that obtained from req.body in signing up process
//It can be also used for signing in because it has email and password property as well 
export interface IRegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
