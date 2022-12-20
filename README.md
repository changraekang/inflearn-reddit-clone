# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command


RDS 연결방법
data-source.ts 에서

import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "RDS endpoint", 
    port: 5432,
    username: "username",
    password: "password",
    database: "postgres", //본인이 설정가능
    synchronize: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: [],
    subscribers: [],
})

해당내용 붙여주기
