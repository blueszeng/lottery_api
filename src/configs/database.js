var database = {
    development: {
        username: process.env.DATABASE_USERNAME_DEV || 'root',
        password: process.env.DATABASE_PASSWORD_DEV || 'my-secret-pw',
        database: process.env.DATABASE_NAME_DEV || 'lottery',
        host: process.env.DATABASE_HOST_DEV || '47.107.155.245',
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4'
        },
        define: {
            underscored: true,
            freezeTableName: true,
            syncOnAssociation: true
        },
        pool: {
            max: 5,
            min: 0,
            idle: 1000
        },
        logging: function(sql) {
            // logger为log4js的Logger实例
            // console.info(sql);
        }
    },
    production: {
        username: process.env.DATABASE_USERNAME_PRO || 'root',
        password: process.env.DATABASE_PASSWORD_PRO || 'my-secret-pw',
        database: process.env.DATABASE_NAME_PRO || 'lottery',
        host: process.env.DATABASE_HOST_PRO || '127.0.0.1',
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4'
        },
        define: {
            underscored: true,
            freezeTableName: true,
            syncOnAssociation: true
        },
        pool: {
            max: 5,
            min: 0,
            idle: 1000
        }
    }
}

module.exports = database