declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      PORT: string;
      jwtSecret: string;
      email: string;
      password: string;
      sentryDNS: string;
      sessionSecret: string;
    }
  }
}

export default {};
