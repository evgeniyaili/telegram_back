import { Sequelize } from 'sequelize'
import config from 'dotenv/config'

export default new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        define: {
            // в базе данных поля будут created_at и updated_at
            underscored: true
        },
        logging: false,
        timezone: 'Europe/Moscow',
    }
)