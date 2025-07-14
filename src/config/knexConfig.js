import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

export const knexconfig = {
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ssl: { 
      rejectUnauthorized: true,
      ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUC16xGzYfMexLWpSuN5xIQGNWoFgwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1YzE3ZGRkNjItMDc1MS00MDY5LTkwM2ItMDVmYTlmMWEx
NGJiIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwNzA0MDMxNzU3WhcNMzUwNzAyMDMx
NzU3WjBAMT4wPAYDVQQDDDVjMTdkZGQ2Mi0wNzUxLTQwNjktOTAzYi0wNWZhOWYx
YTE0YmIgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAOYAWQNc0zpxRTlNdL8vrf9v5XeYE99Itoj5kKz8dJbvzJSXGg3ucvEM
Ahr3YGrcDVKz9fnD3hbnPneV7dy+JODHsZOOqCK+w40TaDrb8S2MyjcERR0j5Jic
j0QQCH/6sQccXnczUFlJR6VdllRC1ZXvINAacUFpLdgJXByw/5NziEaHPoy7Q0n4
J8oQAWzw96lnADDkfnqIydUf5odlHJnM5aSSBKeJOqqeI3XqPDH2cNizSAqxewmS
NorB0a7v+r/+I72j87ppQfHpdaNeIqKeL+hCO2O7XULLmEfysIjL0poulxNMLbJ7
wsZ6ByhvsxkzGJKMjMj+FQ84POKiBUjn3pNPYV0vYm7vAlS1J37qrlWcNMzrh7W6
XyyDYqIprmEetPeOjlkfRpx8NKZ3/SmyqByyj0pZDKkTnbvFoF0uxn6PPL5DXN5X
Hyd7E+CqknZrjRCAE+j2IWaSxspSOFPjt/hHbOlRg2kWxduut9td2VKLK5WDxRxX
GNOQxEKpbwIDAQABo0IwQDAdBgNVHQ4EFgQUNL/YeuS5y+yhfFcwf3lAFS28rTEw
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBAKmOloH+9ZMUpqJ5BmE3710afr+6N0HcrQHxpRcLIt9/ciwFjBn8E9sz+IvL
lhowfU+7xLImjcwPt4LwkpWNO15rIfCXcDM44oLg8KHK1mIM2LEmmdWw1SlWutYm
oNldIdDlyCORwd827f5331NuxDnT3gm3NELI4kLSIQVlhsfnynh73Oh8VNENGiPe
YaYsH+c3nH3blTsqjV7AO+cOn/Of2WRcmM4dPN42eJt+qK3fOnwa35/aWTSCigG2
Kz3fXzI2X2JeH1AGyndrutah1kyQC6nEXEapEvSKY1ZGbbv67JEhLZgImy+mjmUW
lYmmu9DI3JWr3yiD1s+GHSmkz6JP1YoEQv+Ucho1E7WvhG4EHz9wVygTJTe87gC1
mNC2q5iLilEYMY5WUEUdKcaL32cjlUvqIWF+0Cg94ciR1nGeFZrmwAKlnrg3dz1H
t0YLZ+d00ve174KaIwSmhMfSXAkFTEAqXznmMjsOL7JCXnChRRj0JZCezHNQWNfA
2Mpnqg==
-----END CERTIFICATE-----`
    },
    connectTimeout: 60000,
  },
  pool: { 
    min: 0, 
    max: 5,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
};