module.exports = ({ env }) => ({
  host: env('HOST', '192.168.60.190'),
  port: env.int('PORT', 1337),
});
