import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://50bdb7a9cd5d0b2bee2a4edbafdf13a2@o4511398915866624.ingest.de.sentry.io/4511398926876752",
  
  sendDefaultPii: true,
});