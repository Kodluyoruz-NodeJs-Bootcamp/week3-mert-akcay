import {Entity, ObjectIdColumn, ObjectID, Column} from "typeorm";

@Entity({name:"Users"})
export class User {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({unique:true})
    email: string;

    @Column()
    password: string;

}
