import { Session, SessionData } from 'express-session';
import { Types } from 'mongoose';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: Session & {
        userId?: string;
      };
    }
  }
}
