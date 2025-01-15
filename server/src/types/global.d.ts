/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
declare global {
  namespace api {
  }
  const console: Console
}
namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
  }
}
