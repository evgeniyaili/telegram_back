import { Sequelize } from 'sequelize'


export default new Sequelize(
    'postgres://postgres:postgres@192.168.0.2:5432/postgres',
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