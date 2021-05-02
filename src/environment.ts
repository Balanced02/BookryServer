declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      PORT: string;
      jwtSecret: string;
      email: string;
      password: string;
    }
  }
}

export default {};
