const config = {
    development: {
        api: 'http://localhost:12180',
    },
    production: {
        api: 'https://xrcade.herokuapp.com'
    }
};

const nodeEnv = localStorage.getItem('env') || process.env.NODE_ENV // TODO: Make better
const isProd = nodeEnv === 'production'

const configKey = isProd
    ? 'production'
    : 'development'

console.info(`Loading [${configKey}] config`)
const conf = config[configKey];
export {
    conf as config
};
